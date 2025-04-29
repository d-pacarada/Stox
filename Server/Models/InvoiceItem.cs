namespace Server.Models
{
    public class InvoiceItem
    {
        public int Invoice_Item_ID { get; set; }
        public int Invoice_ID { get; set; }
        public int Product_ID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
