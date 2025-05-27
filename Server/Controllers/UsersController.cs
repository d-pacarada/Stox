    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Server.Data;
    using Server.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    namespace Server.Controllers
    {
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.User
                .Where(u => !u.IsDeleted)
                .ToListAsync();

            return Ok(users);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.User.FindAsync(id);
            if (user == null)
                return NotFound();

            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        }
    }
