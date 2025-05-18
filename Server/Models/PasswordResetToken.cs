using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class PasswordResetToken
{
    [Key]
    public int Id { get; set; }

    public int User_ID { get; set; }

    [Required]
    public string Token { get; set; }

    public DateTime Expiration { get; set; }

    [ForeignKey("User_ID")]
    public User User { get; set; }
}
