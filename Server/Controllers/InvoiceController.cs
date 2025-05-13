using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoiceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] InvoiceRequest request)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);

            var invoice = new Invoice
            {
                Customer_ID = request.Customer_ID,
                Total_Amount = request.Total_Amount,
                User_ID = userId,
                Invoice_Date = DateTime.Now
            };

            _context.Invoice.Add(invoice);
            await _context.SaveChangesAsync(); // Save to generate Invoice_ID

            foreach (var item in request.Items)
            {
                // Create and add invoice item
                var invoiceItem = new InvoiceItem
                {
                    Invoice_ID = invoice.Invoice_ID,
                    Product_ID = item.Product_ID,
                    Quantity = item.Quantity,
                    Price = item.Price
                };

                _context.InvoiceItems.Add(invoiceItem);

                // Decrement stock
                var product = await _context.Product.FindAsync(item.Product_ID);
                if (product != null)
                {
                    product.Stock_Quantity -= item.Quantity;

                    if (product.Stock_Quantity < 0)
                    {
                        product.Stock_Quantity = 0; // Optional safeguard
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invoice created", invoiceId = invoice.Invoice_ID });
        }
    }
}
