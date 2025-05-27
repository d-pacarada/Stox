using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Product
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Product_ID,
                    p.Product_Name,
                    p.Description,
                    Category_ID = p.Category_ID,
                    Category_Name = p.Category.Category_Name,
                    p.Stock_Quantity,
                    p.Price
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetProductsForUser()
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");
        
            var userId = int.Parse(userIdString);
        
            var products = await _context.Product
                .Where(p => p.User_ID == userId && !p.IsDeleted)
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Product_ID,
                    p.Product_Name,
                    p.Description,
                    Category_ID = p.Category_ID,
                    Category_Name = p.Category.Category_Name,
                    p.Stock_Quantity,
                    p.Price
                })
                .ToListAsync();
        
            return Ok(products);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Product
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Product_ID == id);
        
            if (product == null)
                return NotFound();
        
            return Ok(product); // nuk filtrohet me IsDeleted që të shfaqet në fatura/histori
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("User ID not found in token.");
        
            product.User_ID = int.Parse(userIdString);
        
            if (!await _context.Category.AnyAsync(c => c.Category_ID == product.Category_ID))
                return BadRequest("Invalid Category ID.");
        
            _context.Product.Add(product);
        
            // ✅ Log "Created Product"
            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = product.User_ID,
                Action = "Created Product",
                Timestamp = DateTime.UtcNow
            });
        
            await _context.SaveChangesAsync();
        
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var product = await _context.Product.FindAsync(id);

            if (product == null)
                return NotFound("Product not found");

            product.Product_Name = updatedProduct.Product_Name;
            product.Description = updatedProduct.Description;
            product.Category_ID = updatedProduct.Category_ID;
            product.Stock_Quantity = updatedProduct.Stock_Quantity;
            product.Price = updatedProduct.Price;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null)
                return NotFound();

            product.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // -----------------------------------------
        // CATEGORY METHODS BELOW
        // -----------------------------------------

        [HttpGet("category/user")]
        [Authorize]
        public async Task<IActionResult> GetCategoriesForUser()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);

            var categories = await _context.Category
                .Where(c => c.User_ID == userId)
                .Select(c => new { c.Category_ID, c.Category_Name })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost("category")]
        [Authorize]
        public async Task<IActionResult> AddCategory([FromBody] Category category)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);

            bool exists = await _context.Category.AnyAsync(c =>
                c.User_ID == userId &&
                c.Category_Name.ToLower() == category.Category_Name.ToLower());

            if (exists)
                return BadRequest("Category already exists.");

            category.User_ID = userId;

            _context.Category.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }
    }
}
