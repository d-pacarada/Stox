using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Server.Data;
using Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

            var userRole = new UserRole
            {
                User_ID = createdUser.User_ID,
                Role_ID = defaultRole.Role_ID
            };

            _context.UserRole.Add(userRole);

            // ✅ Log "Registered" action
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

            return Ok(new { token, role });
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

            // ✅ Log "Logged in" action
            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = user.User_ID,
                Action = "Logged in",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user, role);
            return Ok(new { token, role });
        }

        [HttpPost("check-email")]
        public async Task<IActionResult> CheckEmail([FromBody] EmailCheckRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            var exists = await _context.User.AnyAsync(u => u.Email == request.Email);
            return Ok(new { exists });
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

            await _context.SaveChangesAsync();
            return Ok("Logout logged.");
        }


        // ✅ Accepts role and includes it in JWT claims
        private string GenerateJwtToken(User user, string role)
        {
            var keyString = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(keyString) || keyString.Length < 32)
                throw new Exception("JWT Key is missing or too short in configuration.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
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
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Request Models
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
