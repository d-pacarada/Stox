namespace Server.Models
{
    public class PurchaseInvoiceItem
    {
        public int PurchaseInvoice_Item_ID { get; set; }
        public int PurchaseInvoice_ID { get; set; }
        public int Product_ID { get; set; }
        public int Quantity { get; set; }
        public decimal Purchase_Price { get; set; }
    }
}
