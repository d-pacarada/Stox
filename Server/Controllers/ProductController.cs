using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

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

        // GET api/product
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
                    Category_ID = p.Category_ID,   // ✅ Send real Category_ID
                    Category_Name = p.Category.Category_Name, // ✅ Also send readable name
                    p.Stock_Quantity,
                    p.Price
            })
                .ToListAsync();

            return Ok(products);
        }


        // GET api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Product
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Product_ID == id);

            if (product == null)
                return NotFound();

            return Ok(product);
        }

        // POST api/product
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (!await _context.Category.AnyAsync(c => c.Category_ID == product.Category_ID))
                return BadRequest("Invalid Category ID.");

            _context.Product.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // PUT api/product/{id}
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


        // DELETE api/product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Product.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
    }
}
