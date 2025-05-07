using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Models  
{
    public class Contact
    {
        [Key]
        public int Contact_ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        public string Message { get; set; }

        public DateTime Date { get; set; }
    }
}
