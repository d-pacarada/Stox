using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("Invoice_Items")]
    public class InvoiceItem
    {
        [Key]
        public int Invoice_Item_ID { get; set; }

        [ForeignKey("Invoice")]
        public int Invoice_ID { get; set; }

        [ForeignKey("Product")]
        public int Product_ID { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }
        public Invoice Invoice { get; set; }
        public Product Product { get; set; }
    }
}
