using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        // Update User Details (Address, Phone Number, Transit Number)
        [HttpPut("update-details")]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateDetails([FromBody] UpdateDetailsRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        
            var user = await _context.User.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");
        
            user.Address = request.Address;
            user.Phone_Number = request.PhoneNumber;
            user.Transit_Number = request.TransitNumber;
        
            // ✅ Log "Updated Info"
            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = userId,
                Action = "Updated Info",
                Timestamp = DateTime.UtcNow
            });
        
            await _context.SaveChangesAsync();
        
            return Ok("Details updated successfully.");
        }


        // Update Password
        [HttpPut("update-password")]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var user = await _context.User.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
                return BadRequest("Current password is incorrect.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password updated successfully.");
        }
    }

    // DTOs
    public class UpdateDetailsRequest
    {
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string TransitNumber { get; set; }
    }

    public class UpdatePasswordRequest
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
