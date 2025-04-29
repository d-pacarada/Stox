namespace Server.Models
{
    public class PurchaseInvoice
    {
        public int PurchaseInvoice_ID { get; set; }
        public string Supplier_Name { get; set; }
        public DateTime Purchase_Date { get; set; } = DateTime.Now;
        public decimal Total_Amount { get; set; }
    }
}
