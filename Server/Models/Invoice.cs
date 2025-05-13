using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Invoice
    {
        [Key]
        public int Invoice_ID { get; set; }
        public int Customer_ID { get; set; }
        public DateTime Invoice_Date { get; set; } = DateTime.Now;
        public decimal Total_Amount { get; set; }
        public int User_ID { get; set; }

        [ForeignKey("Customer_ID")]
        public Customer Customer { get; set; }
    }
}
