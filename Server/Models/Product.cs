using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Product
    {
        [Key]
        public int Product_ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Product_Name { get; set; }

        public string Description { get; set; }

        [ForeignKey("Category")]
        public int Category_ID { get; set; }

        // ✅ Make this nullable so EF Core doesn't require it during POST/PUT
        public Category? Category { get; set; }

        public int Stock_Quantity { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }
    }
}
