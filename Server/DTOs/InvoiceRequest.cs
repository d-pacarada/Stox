using System.Collections.Generic;

namespace Server.DTOs
{
    public class InvoiceRequest
    {
        public int Customer_ID { get; set; }
        public decimal Total_Amount { get; set; }
        public List<InvoiceItemDTO> Items { get; set; }
    }

    public class InvoiceItemDTO
    {
        public int Product_ID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
