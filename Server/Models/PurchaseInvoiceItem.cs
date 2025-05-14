using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("purchaseinvoice_items")]
    public class PurchaseInvoiceItem
    {
        [Key]
        public int PurchaseInvoice_Item_ID { get; set; }

        public int PurchaseInvoice_ID { get; set; }
        [ForeignKey("PurchaseInvoice_ID")]
        public PurchaseInvoice PurchaseInvoice { get; set; } // ✅ Navigation

        public int Product_ID { get; set; }
        [ForeignKey("Product_ID")]
        public Product Product { get; set; } // Optional but good practice

        public int Quantity { get; set; }

        public decimal Purchase_Price { get; set; }
    }
}
