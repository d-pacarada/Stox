using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Category
    {
        [Key]
        public int Category_ID { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category_Name { get; set; }
    }
}
