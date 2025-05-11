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
            var users = await _context.User.ToListAsync();
            return Ok(users);
        }

       [HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser(int id)
{
    var user = await _context.User
        .Include(u => u.Customers)
        .FirstOrDefaultAsync(u => u.User_ID == id);

    if (user == null)
        return NotFound();

    
    if (user.Customers != null)
        _context.Customer.RemoveRange(user.Customers);

   
    var products = _context.Product.Where(p => p.User_ID == id);
    _context.Product.RemoveRange(products);

    
    var userRoles = _context.UserRole.Where(ur => ur.User_ID == id);
    _context.UserRole.RemoveRange(userRoles);

    
    _context.User.Remove(user);
    await _context.SaveChangesAsync();

    return NoContent();
}

    }
}
