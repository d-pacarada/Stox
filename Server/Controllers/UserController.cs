using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Needed for FirstOrDefaultAsync
using Server.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetUserInfo()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.User
                .Where(u => u.User_ID == userId)
                .Select(u => new
                {
                    Email = u.Email,
                    BusinessName = u.Business_Name,
                    BusinessNumber = u.Business_Number
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found.");

            return Ok(user);
        }
    }
}