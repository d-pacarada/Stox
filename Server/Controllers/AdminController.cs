using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("user-activity")]
        public async Task<IActionResult> GetUserActivityPanel()
        {
            var today = DateTime.UtcNow.Date;
        
            var usersLoggedInToday = await _context
                .UserActivityLogs
                .Where(log => log.Action == "Logged in" && log.Timestamp.Date == today)
                .Select(log => new
                {
                    log.UserId,
                    Business_Name = log.User.Business_Name,
                    log.Timestamp
                })
                .Distinct()
                .ToListAsync();
        
            var latestLogs = await _context
                .UserActivityLogs
                .OrderByDescending(log => log.Timestamp)
                .Take(10)
                .Select(log => new
                {
                    log.UserId,
                    Business_Name = log.User.Business_Name,
                    log.Action,
                    log.Timestamp
                })
                .ToListAsync();
        
            return Ok(new { usersLoggedInToday, latestLogs });
        }
    }
}
