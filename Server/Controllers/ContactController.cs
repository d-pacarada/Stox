using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Server.Data;
using Server.Models;
using System.Threading.Tasks;
using MimeKit;
using MailKit.Net.Smtp;
using System;

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

            var result = await SendEmailAsync(request.Email, request.Message);
            if (!result)
                return StatusCode(500, "Message saved, but failed to send email.");

            return Ok("Message submitted and email sent successfully.");
        }

private async Task<bool> SendEmailAsync(string userEmail, string message)
{
    try
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("STOX Contact Form", _config["EmailSettings:SenderEmail"]));
        email.To.Add(new MailboxAddress("STOX Admin", "stox.inform@gmail.com"));
        email.Cc.Add(new MailboxAddress("Mete", "mekro112@gmail.com"));
        email.Cc.Add(new MailboxAddress("Donart", "donart.pacarada@gmail.com"));
        email.Subject = $"New Contact Message from {userEmail}";

        string senderIp = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
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
              </div>"
        };

        email.Body = bodyBuilder.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            // Try STARTTLS on port 587
            await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], 587, MailKit.Security.SecureSocketOptions.StartTls);
        }
        catch
        {
            // If failed, try SSL on port 465
            await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], 465, MailKit.Security.SecureSocketOptions.SslOnConnect);
        }

        await smtp.AuthenticateAsync(_config["EmailSettings:SenderEmail"], _config["EmailSettings:SenderPassword"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);

        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine("Email send failed (MailKit): " + ex.Message);
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
