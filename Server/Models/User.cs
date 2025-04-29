using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public int User_ID { get; set; }

    public string Business_Name { get; set; }
    public string Business_Number { get; set; }
    public string Email { get; set; }
    public string Phone_Number { get; set; }
    public string Address { get; set; }
    public string Transit_Number { get; set; }
    public string Password { get; set; }
    public DateTime DATE { get; set; }
}
