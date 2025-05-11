using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Server.Data;
using Server.Models;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public ContactController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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

            var result = SendEmail(request.Email, request.Message);
            if (!result)
                return StatusCode(500, "Message saved, but failed to send email.");

            return Ok("Message submitted and email sent successfully.");
        }

        private bool SendEmail(string userEmail, string message)
        {
            try
            {
                var smtpClient = new SmtpClient(_config["EmailSettings:SmtpServer"])
                {
                    Port = int.Parse(_config["EmailSettings:Port"]),
                    Credentials = new NetworkCredential(
                        _config["EmailSettings:SenderEmail"],
                        _config["EmailSettings:SenderPassword"]
                    ),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_config["EmailSettings:SenderEmail"], "STOX Contact Form"),
                    Subject = $"New Contact Message from {userEmail}",
                    Body = $"Sender: {userEmail}\n\nMessage:\n{message}",
                    IsBodyHtml = false,
                };

                mailMessage.To.Add(_config["EmailSettings:RecipientEmail"]);
                smtpClient.Send(mailMessage);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Email send failed: " + ex.Message);
                return false;
            }
        }

        public class ContactRequest
        {
            public string Email { get; set; }
            public string Message { get; set; }
        }
    }
}
