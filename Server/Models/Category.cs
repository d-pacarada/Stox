using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Category
    {
        [Key] // Marks this as the primary key
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Ensures auto-increment
        public int Category_ID { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category_Name { get; set; }

        [Required]
        public int User_ID { get; set; }

        // Optional navigation property
        [ForeignKey("User_ID")]
        public User? User { get; set; }
    }
}
