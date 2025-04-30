using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class Contact
    {
        [Key]
        public int Contact_ID { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Message { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;
    }
}
