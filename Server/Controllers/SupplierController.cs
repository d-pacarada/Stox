using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupplierController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetSuppliersForUser()
        {
            var suppliers = await _context.PurchaseInvoice
                .Select(p => p.Supplier_Name)
                .Distinct()
                .ToListAsync();

            // Optional: simulate object structure
            var result = suppliers.Select(s => new { name = s }).ToList();

            return Ok(result);
        }
    }
}
