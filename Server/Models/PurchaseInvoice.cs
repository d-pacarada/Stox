using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("purchaseinvoice")]
    public class PurchaseInvoice
    {
        [Key]
        public int PurchaseInvoice_ID { get; set; }
    
        public string Supplier_Name { get; set; }
    
        public DateTime Purchase_Date { get; set; } = DateTime.Now;
    
        public decimal Total_Amount { get; set; }
    
        [ForeignKey(nameof(User))]
        public int User_ID { get; set; }
    
        public User User { get; set; }
    
        public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } // ✅ Add this
    }
}
