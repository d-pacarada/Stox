using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class RefreshToken
    {
        [Key]
        [Column("RefreshToken_ID")]
        public int RefreshToken_ID { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        public DateTime Expires { get; set; }

        [Required]
        public bool IsRevoked { get; set; } = false;

        [Required]
        public int User_ID { get; set; }

        [ForeignKey("User_ID")]
        public User User { get; set; }
    }
}
