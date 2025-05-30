using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Server.Data;
using Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MailKit.Net.Smtp;
using MimeKit;
using System.Security.Cryptography;
using Server.Models.Requests;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.User.AnyAsync(u => u.Email == request.Email))
                return BadRequest("User already exists.");

            var user = new User
            {
                Business_Name = request.BusinessName,
                Business_Number = request.BusinessNumber,
                Email = request.Email,
                Phone_Number = request.Phone,
                Address = request.Address,
                Transit_Number = request.Transit,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                DATE = DateTime.Now
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            var createdUser = await _context.User.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (createdUser == null)
                return StatusCode(500, "Failed to retrieve newly created user.");

            var defaultRole = await _context.Role.FirstOrDefaultAsync(r => r.Role_Name == "User");
            if (defaultRole == null)
                return StatusCode(500, "Default role 'User' not found.");

            _context.UserRole.Add(new UserRole
            {
                User_ID = createdUser.User_ID,
                Role_ID = defaultRole.Role_ID
            });

            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = createdUser.User_ID,
                Action = "Registered",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var role = await _context.UserRole
                .Include(ur => ur.Role)
                .Where(ur => ur.User_ID == createdUser.User_ID)
                .Select(ur => ur.Role.Role_Name)
                .FirstOrDefaultAsync();

            var token = GenerateJwtToken(createdUser, role);
            var refreshToken = GenerateRefreshToken(createdUser.User_ID);

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return Ok(new { token, refreshToken = refreshToken.Token, role });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return Unauthorized("Invalid email or password.");

            var role = await _context.UserRole
                .Include(ur => ur.Role)
                .Where(ur => ur.User_ID == user.User_ID)
                .Select(ur => ur.Role.Role_Name)
                .FirstOrDefaultAsync();

            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = user.User_ID,
                Action = "Logged in",
                Timestamp = DateTime.UtcNow
            });

            var token = GenerateJwtToken(user, role);
            var refreshToken = GenerateRefreshToken(user.User_ID);

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return Ok(new { token, refreshToken = refreshToken.Token, role });
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = request.RefreshToken;

            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest("The refreshToken field is required.");

            var tokenInDb = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshToken && r.Expires > DateTime.UtcNow && !r.IsRevoked);

            if (tokenInDb == null)
                return Unauthorized("Invalid or expired refresh token.");

            var role = await _context.UserRole
                .Include(ur => ur.Role)
                .Where(ur => ur.User_ID == tokenInDb.User_ID)
                .Select(ur => ur.Role.Role_Name)
                .FirstOrDefaultAsync();

            tokenInDb.IsRevoked = true;
            var newRefreshToken = GenerateRefreshToken(tokenInDb.User_ID);
            _context.RefreshTokens.Add(newRefreshToken);

            var newAccessToken = GenerateJwtToken(tokenInDb.User, role);
            await _context.SaveChangesAsync();

            return Ok(new { token = newAccessToken, refreshToken = newRefreshToken.Token });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found.");

            int userId = int.Parse(userIdClaim);

            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = userId,
                Action = "Logged out",
                Timestamp = DateTime.UtcNow
            });

            var activeTokens = await _context.RefreshTokens
                .Where(t => t.User_ID == userId && !t.IsRevoked && t.Expires > DateTime.UtcNow)
                .ToListAsync();

            foreach (var token in activeTokens)
                token.IsRevoked = true;

            await _context.SaveChangesAsync();

            return Ok("Logout logged and tokens revoked.");
        }

        [HttpPost("check-email")]
        public async Task<IActionResult> CheckEmail([FromBody] EmailCheckRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            var exists = await _context.User.AnyAsync(u => u.Email == request.Email);
            return Ok(new { exists });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            var user = await _context.User.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return Ok("If this email exists, a reset link has been sent.");

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            _context.PasswordResetTokens.Add(new PasswordResetToken
            {
                User_ID = user.User_ID,
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1)
            });

            await _context.SaveChangesAsync();

            var resetUrl = $"{_config["FrontendBaseUrl"]}/reset-password?token={Uri.EscapeDataString(token)}";

            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_config["EmailSettings:SenderEmail"]));
            message.To.Add(MailboxAddress.Parse(user.Email));
            message.Subject = "Reset Your Password";
            message.Body = new TextPart("plain")
            {
                Text = $"Hello,\n\nClick below to reset your password:\n{resetUrl}\n\nThis link will expire in 1 hour."
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], int.Parse(_config["EmailSettings:Port"]), true);
            await smtp.AuthenticateAsync(_config["EmailSettings:SenderEmail"], _config["EmailSettings:SenderPassword"]);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            return Ok("If this email exists, a reset link has been sent.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest("Token and new password are required.");

            var tokenEntry = await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == request.Token && t.Expiration > DateTime.UtcNow);

            if (tokenEntry == null)
                return BadRequest("Invalid or expired token.");

            tokenEntry.User.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            _context.PasswordResetTokens.Remove(tokenEntry);
            await _context.SaveChangesAsync();

            return Ok("Password reset successful.");
        }

        private string GenerateJwtToken(User user, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim("userId", user.User_ID.ToString()),
                    new Claim(ClaimTypes.Role, role)
                },
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken(int userId)
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expires = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                User_ID = userId
            };
        }
    }

    // DTOs
    public class RegisterRequest
    {
        public string BusinessName { get; set; }
        public string BusinessNumber { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Transit { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class EmailCheckRequest
    {
        public string Email { get; set; }
    }
}
