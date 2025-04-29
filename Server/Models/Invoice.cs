namespace Server.Models
{
    public class Invoice
    {
        public int Invoice_ID { get; set; }
        public int Customer_ID { get; set; }
        public DateTime Invoice_Date { get; set; } = DateTime.Now;
        public decimal Total_Amount { get; set; }
    }
}
