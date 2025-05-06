using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Customer
    {
        [Key]
        public int Customer_ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Full_Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Phone_Number { get; set; }

        [Required]
        public string Address { get; set; }

        [ForeignKey("User")]
        public int? User_ID { get; set; } // ✅ FIXED - Nullable User_ID

        public User? User { get; set; }
    }
}
