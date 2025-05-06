using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Only allow authenticated users
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomerController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET api/customer/user → Load customers only for the logged-in user
        [HttpGet("user")]
        public async Task<IActionResult> GetUserCustomers()
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");

            var userId = int.Parse(userIdString);

            var customers = await _context.Customer
                .Where(c => c.User_ID == userId)
                .ToListAsync();

            return Ok(customers);
        }

        // ✅ GET api/customer/{id} → Get single customer by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _context.Customer.FindAsync(id);

            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // ✅ POST api/customer → Add new customer (assign user id from token)
        [HttpPost]
        public async Task<IActionResult> AddCustomer([FromBody] Customer customer)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");

            var userId = int.Parse(userIdString);
            customer.User_ID = userId;

            _context.Customer.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(customer);
        }

        // ✅ PUT api/customer/{id} → Update customer
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] Customer updatedCustomer)
        {
            if (id != updatedCustomer.Customer_ID)
                return BadRequest("Customer ID mismatch.");

            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");

            var userId = int.Parse(userIdString);

            var customer = await _context.Customer
                .Where(c => c.Customer_ID == id && c.User_ID == userId)
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound("Customer not found or does not belong to this user.");

            // Update customer fields
            customer.Full_Name = updatedCustomer.Full_Name;
            customer.Email = updatedCustomer.Email;
            customer.Phone_Number = updatedCustomer.Phone_Number;
            customer.Address = updatedCustomer.Address;

            await _context.SaveChangesAsync();

            return Ok(customer);
        }

        // ✅ DELETE api/customer/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");

            var userId = int.Parse(userIdString);

            var customer = await _context.Customer
                .Where(c => c.Customer_ID == id && c.User_ID == userId)
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound();

            _context.Customer.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
