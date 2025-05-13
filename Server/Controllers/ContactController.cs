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

        // ✅ Fix: Move senderIp declaration here
        string senderIp = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_config["EmailSettings:SenderEmail"], "STOX Contact Form"),
            Subject = $"New Contact Message from {userEmail}",
            Body = $@"
              <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;'>
                <div style='text-align: center; margin-bottom: 20px;'>
                    <img src='https://i.imgur.com/hIUt2pQ.png' alt='STOX Logo' style='max-height: 60px;' />
                </div>

                <h2 style='color: #112D4E; border-bottom: 2px solid #3ABEF9; padding-bottom: 10px;'>📩 New Contact Message</h2>

                <p style='margin: 20px 0; font-size: 15px;'>
                  <strong>Sender:</strong> 
                  <a href='mailto:{userEmail}' style='color: #3ABEF9; text-decoration: none;'>{userEmail}</a>
                </p>

                <p style='font-size: 15px;'><strong>Message:</strong></p>
                <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3ABEF9; border-radius: 5px; font-size: 14px; line-height: 1.5;'>
                  {System.Net.WebUtility.HtmlEncode(message).Replace("\n", "<br/>")}
                </div>

                <div style='margin: 25px 0; text-align: center;'>
                  <a href='mailto:{userEmail}' style='background-color: #3ABEF9; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;'>
                    📧 Reply to {userEmail}
                  </a>
                </div>

                <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;' />

                <p style='font-size: 12px; color: #777;'>
                  📅 Submitted on <strong>{DateTime.Now:MMMM dd, yyyy HH:mm}</strong><br/>
                  🌐 Sender IP: <strong>{senderIp}</strong>
                </p>

                <p style='font-size: 12px; color: #999; text-align: center; margin-top: 30px;'>
                  This message was sent via the <strong>STOX Contact Form</strong>.
                </p>
              </div>",
            IsBodyHtml = true
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
