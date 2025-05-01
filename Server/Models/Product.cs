using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Product
    {
        public int Product_ID { get; set; }
        public string Product_Name { get; set; }
        public string Description { get; set; }
        public int Stock_Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
