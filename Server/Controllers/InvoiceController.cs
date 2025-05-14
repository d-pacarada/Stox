using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Net;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MimeKit;
using MailKit.Net.Smtp;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public InvoiceController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        private int? GetUserIdFromClaims()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetInvoicesForUser()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
                return Unauthorized(new { message = "User ID not found in token." });

            var invoices = await _context.Invoice
                .Include(i => i.Customer)
                .Where(i => i.User_ID == userId)
                .Select(i => new
                {
                    invoice_ID = i.Invoice_ID,
                    customerName = i.Customer.Full_Name,
                    customerEmail = i.Customer.Email,
                    invoice_Date = i.Invoice_Date,
                    total_Amount = i.Total_Amount
                })
                .ToListAsync();

            return Ok(invoices);
        }

        [HttpGet("details/{invoiceId}")]
        public async Task<IActionResult> GetInvoiceDetails(int invoiceId)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
                return Unauthorized(new { message = "User ID not found in token." });

            var invoice = await _context.Invoice
                .FirstOrDefaultAsync(i => i.Invoice_ID == invoiceId && i.User_ID == userId);

            if (invoice == null)
                return NotFound(new { message = "Invoice not found." });

            var items = await _context.InvoiceItems
                .Where(ii => ii.Invoice_ID == invoiceId)
                .Join(_context.Product,
                      ii => ii.Product_ID,
                      p => p.Product_ID,
                      (ii, p) => new
                      {
                          product_Name = p.Product_Name,
                          quantity = ii.Quantity,
                          price = ii.Price,
                          amount = ii.Quantity * ii.Price
                      })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] InvoiceRequest request)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var invoice = new Invoice
            {
                Customer_ID = request.Customer_ID,
                Total_Amount = request.Total_Amount,
                User_ID = userId.Value,
                Invoice_Date = DateTime.Now
            };

            _context.Invoice.Add(invoice);
            await _context.SaveChangesAsync();

            foreach (var item in request.Items)
            {
                var invoiceItem = new InvoiceItem
                {
                    Invoice_ID = invoice.Invoice_ID,
                    Product_ID = item.Product_ID,
                    Quantity = item.Quantity,
                    Price = item.Price
                };

                _context.InvoiceItems.Add(invoiceItem);

                var product = await _context.Product.FindAsync(item.Product_ID);
                if (product != null)
                {
                    product.Stock_Quantity -= item.Quantity;
                    if (product.Stock_Quantity < 0)
                        product.Stock_Quantity = 0;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Invoice created", invoiceId = invoice.Invoice_ID });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                    return Unauthorized(new { message = "User ID not found in token." });

                var invoice = await _context.Invoice
                    .FirstOrDefaultAsync(i => i.Invoice_ID == id && i.User_ID == userId);

                if (invoice == null)
                    return NotFound(new { message = "Invoice not found or unauthorized." });

                var invoiceItems = await _context.InvoiceItems
                    .Where(ii => ii.Invoice_ID == id)
                    .ToListAsync();

                _context.InvoiceItems.RemoveRange(invoiceItems);
                _context.Invoice.Remove(invoice);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Invoice deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Server error while deleting invoice.",
                    error = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        private byte[] BuildInvoicePdf(InvoiceGenRequest request)
        {
            try
            {
                if (request.Items == null || !request.Items.Any())
                    throw new Exception("Invoice items are missing.");

                foreach (var item in request.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.Name))
                        throw new Exception("Product name is missing.");
                    if (item.Quantity <= 0)
                        throw new Exception("Invalid quantity.");
                }

                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);

                        page.Header().Text($"Invoice #{request.Number}")
                            .FontSize(20).SemiBold().AlignCenter();

                        page.Content().PaddingVertical(10).Column(column =>
                        {
                            column.Spacing(10);
                            column.Item().Text($"From: {request.From}").FontSize(12);
                            column.Item().Text($"To: {request.To}").FontSize(12);
                            column.Item().LineHorizontal(1).LineColor(Colors.Grey.Medium);

                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(5);
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(3);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(HeaderCellStyle).Text("Product").FontSize(12).Bold();
                                    header.Cell().Element(HeaderCellStyle).Text("Quantity").FontSize(12).Bold();
                                    header.Cell().Element(HeaderCellStyle).Text("Price").FontSize(12).Bold();

                                    static IContainer HeaderCellStyle(IContainer container) =>
                                        container.DefaultTextStyle(x => x.SemiBold()).Padding(5).Background(Colors.Grey.Lighten3).Border(1).BorderColor(Colors.Grey.Lighten1);
                                });

                                foreach (var item in request.Items)
                                {
                                    table.Cell().Element(BodyCellStyle).Text(item.Name);
                                    table.Cell().Element(BodyCellStyle).Text(item.Quantity.ToString());
                                    table.Cell().Element(BodyCellStyle).Text($"{item.Unit_Cost:0.00} €");

                                    static IContainer BodyCellStyle(IContainer container) =>
                                        container.Padding(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                                }
                            });

                            decimal total = request.Items.Sum(item => item.Quantity * item.Unit_Cost);
                            column.Item().AlignRight().Text($"Total: {total:0.00} €").FontSize(12).SemiBold();

                        });
                        page.Footer().AlignCenter().Text("Thank you for your business!").FontSize(10);
                    });
                });

                return document.GeneratePdf();
            }
            catch (Exception ex)
            {
                throw new Exception("PDF generation failed:", ex);
            }
        }

        [HttpPost("generate")]
        public IActionResult GenerateInvoicePdf([FromBody] InvoiceGenRequest request)
        {
            try
            {
                var pdfBytes = BuildInvoicePdf(request);
                return File(pdfBytes, "application/pdf", $"invoice_{request.Number}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to generate PDF", error = ex.ToString() });
            }
        }

        [HttpPost("email")]
        public async Task<IActionResult> GenerateAndSendInvoice([FromBody] InvoiceGenRequest request)
        {
            try
            {
                var pdfBytes = BuildInvoicePdf(request);
        
                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(_config["EmailSettings:SenderEmail"]));
                message.To.Add(MailboxAddress.Parse(request.To));
                message.Subject = $"Invoice #{request.Number}";
        
                var builder = new BodyBuilder
                {
                    TextBody = $"Dear customer,\n\nPlease find attached invoice #{request.Number}.\n\nBest regards,\nSTOX"
                };
                builder.Attachments.Add($"invoice_{request.Number}.pdf", pdfBytes, new ContentType("application", "pdf"));
                message.Body = builder.ToMessageBody();
        
                using var smtp = new SmtpClient();
        
                try
                {
                    // Try STARTTLS (587)
                    await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], 587, MailKit.Security.SecureSocketOptions.StartTls);
                }
                catch
                {
                    // Fallback to SSL (465)
                    await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], 465, MailKit.Security.SecureSocketOptions.SslOnConnect);
                }
        
                await smtp.AuthenticateAsync(_config["EmailSettings:SenderEmail"], _config["EmailSettings:SenderPassword"]);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);
        
                return Ok(new { message = "Invoice email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send invoice email", error = ex.ToString() });
            }
        }
    }

    public class InvoiceGenRequest
    {
        public string From { get; set; }
        public string To { get; set; }
        public List<InvoiceGenItem> Items { get; set; }
        public int Number { get; set; }
        public decimal Amount_Paid { get; set; } = 0;
    }

    public class InvoiceGenItem
    {
        public string Name { get; set; }
        public int Quantity { get; set; }
        public decimal Unit_Cost { get; set; }
    }

    public class InvoiceRequest
    {
        public int Customer_ID { get; set; }
        public decimal Total_Amount { get; set; }
        public List<InvoiceItemRequest> Items { get; set; }
    }

    public class InvoiceItemRequest
    {
        public int Product_ID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}