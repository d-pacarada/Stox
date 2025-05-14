    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using MimeKit;
    using MailKit.Net.Smtp;
    using QuestPDF.Fluent;
    using QuestPDF.Helpers;
    using QuestPDF.Infrastructure;
    using Server.Data;
    using Server.Models;
    using System.Net;

    namespace Server.Controllers
    {
        [Route("api/[controller]")]
        [ApiController]
        [Authorize]
        public class PurchaseController : ControllerBase
        {
            private readonly AppDbContext _context;
            private readonly IConfiguration _config;

            public PurchaseController(AppDbContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            private int? GetUserIdFromClaims()
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
                return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
            }

            [HttpPost]
            public async Task<IActionResult> CreatePurchase([FromBody] PurchaseRequest request)
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                    return Unauthorized("User ID not found in token.");

                var purchase = new PurchaseInvoice
                {
                    Supplier_Name = request.Supplier_Name,
                    Total_Amount = request.Total_Amount,
                    Purchase_Date = DateTime.Now,
                    User_ID = userId.Value
                };

                _context.PurchaseInvoice.Add(purchase);
                await _context.SaveChangesAsync();

                foreach (var item in request.Items)
                {
                    var piItem = new PurchaseInvoiceItem
                    {
                        PurchaseInvoice_ID = purchase.PurchaseInvoice_ID,
                        Product_ID = item.Product_ID,
                        Quantity = item.Quantity,
                        Purchase_Price = item.Price
                    };

                    _context.PurchaseInvoiceItem.Add(piItem);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Purchase created", purchaseId = purchase.PurchaseInvoice_ID });
            }

            [HttpGet("user")]
            public async Task<IActionResult> GetPurchasesForUser()
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                    return Unauthorized();

                var purchases = await _context.PurchaseInvoice
                    .Where(p => p.User_ID == userId.Value)
                    .OrderByDescending(p => p.Purchase_Date)
                    .Join(_context.User,
                        p => p.User_ID,
                        u => u.User_ID,
                        (p, u) => new
                        {
                            purchase_ID = p.PurchaseInvoice_ID,
                            supplier_Name = p.Supplier_Name,
                            supplier_Email = u.Email,
                            purchase_Date = p.Purchase_Date,
                            total_Amount = p.Total_Amount,
                            items = _context.PurchaseInvoiceItem
                                .Where(i => i.PurchaseInvoice_ID == p.PurchaseInvoice_ID)
                                .Join(_context.Product,
                                    i => i.Product_ID,
                                    prod => prod.Product_ID,
                                    (i, prod) => new
                                    {
                                        name = prod.Product_Name,
                                        quantity = i.Quantity,
                                        unit_Cost = i.Purchase_Price
                                    }).ToList()
                        })
                    .ToListAsync();

                return Ok(purchases);
            }

            [HttpPost("generate")]
            public IActionResult GeneratePdf([FromBody] PurchaseGenRequest request)
            {
                if (string.IsNullOrWhiteSpace(request.To))
                    return BadRequest(new { message = "The To field is required." });

                var pdfBytes = BuildPurchasePdf(request);
                return File(pdfBytes, "application/pdf", $"purchase_{request.Number}.pdf");
            }

            [HttpPost("email")]
            public async Task<IActionResult> SendEmail([FromBody] PurchaseGenRequest request)
            {
                if (string.IsNullOrWhiteSpace(request.To))
                    return BadRequest(new { message = "The To field is required." });

                var pdfBytes = BuildPurchasePdf(request);

                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(_config["EmailSettings:SenderEmail"]));
                message.To.Add(MailboxAddress.Parse(request.To));
                message.Subject = $"Purchase Invoice #{request.Number}";

                var builder = new BodyBuilder
                {
                    TextBody = $"Dear supplier,\n\nPlease find attached purchase invoice #{request.Number}.\n\nBest regards,\nSTOX"
                };
                builder.Attachments.Add($"purchase_{request.Number}.pdf", pdfBytes, new ContentType("application", "pdf"));
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

                return Ok(new { message = "Purchase invoice email sent successfully." });
            }


            [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchase(int id)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
                return Unauthorized();

            var purchase = await _context.PurchaseInvoice
                .FirstOrDefaultAsync(p => p.PurchaseInvoice_ID == id && p.User_ID == userId.Value);

            if (purchase == null)
                return NotFound("Purchase not found or unauthorized.");

            // Delete associated items first
            var items = await _context.PurchaseInvoiceItem
                .Where(i => i.PurchaseInvoice_ID == id)
                .ToListAsync();

            _context.PurchaseInvoiceItem.RemoveRange(items);
            _context.PurchaseInvoice.Remove(purchase);

            await _context.SaveChangesAsync();
            return Ok("Purchase deleted successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to delete purchase", error = ex.Message });
        }
    }
            
            
            private byte[] BuildPurchasePdf(PurchaseGenRequest request)
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);

                        page.Header().Text($"Purchase Invoice #{request.Number}")
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
                                    header.Cell().Element(CellStyle).Text("Product").FontSize(12).Bold();
                                    header.Cell().Element(CellStyle).Text("Quantity").FontSize(12).Bold();
                                    header.Cell().Element(CellStyle).Text("Price").FontSize(12).Bold();

                                    static IContainer CellStyle(IContainer container) =>
                                        container.DefaultTextStyle(x => x.SemiBold()).Padding(5).Background(Colors.Grey.Lighten3).Border(1).BorderColor(Colors.Grey.Lighten1);
                                });

                                foreach (var item in request.Items)
                                {
                                    table.Cell().Element(BodyStyle).Text(item.Name);
                                    table.Cell().Element(BodyStyle).Text(item.Quantity.ToString());
                                    table.Cell().Element(BodyStyle).Text($"{item.Unit_Cost:0.00} €");

                                    static IContainer BodyStyle(IContainer container) =>
                                        container.Padding(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                                }
                            });

                            decimal total = request.Items.Sum(item => item.Quantity * item.Unit_Cost);
                            column.Item().AlignRight().Text($"Total: {total:0.00} €").FontSize(12).SemiBold();
                        });

                        page.Footer().AlignCenter().Text("Processed by STOX System").FontSize(10);
                    });
                });

                return document.GeneratePdf();
            }
        }

        

        public class PurchaseRequest
        {
            public string Supplier_Name { get; set; }
            public decimal Total_Amount { get; set; }
            public List<PurchaseItemRequest> Items { get; set; }
        }

        public class PurchaseItemRequest
        {
            public int Product_ID { get; set; }
            public int Quantity { get; set; }
            public decimal Price { get; set; }
        }

        public class PurchaseGenRequest
        {
            public string From { get; set; }
            public string To { get; set; }
            public int Number { get; set; }
            public List<PurchaseGenItem> Items { get; set; }
        }

        public class PurchaseGenItem
        {
            public string Name { get; set; }
            public int Quantity { get; set; }
            public decimal Unit_Cost { get; set; }
        }
    }
