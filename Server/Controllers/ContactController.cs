using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] 
        public async Task<IActionResult> SubmitContact([FromBody] ContactRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Email and message are required.");

            var contact = new Contact
            {
                Email = request.Email,
                Message = request.Message,
                Date = DateTime.Now
            };

            _context.Contact.Add(contact); 
            await _context.SaveChangesAsync();

            return Ok("Message submitted successfully.");
        }

        public class ContactRequest
        {
            public string Email { get; set; }
            public string Message { get; set; }
        }
    }
}
