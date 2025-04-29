using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("User_Role")]
public class UserRole
{
    [Key]
    public int User_Role_ID { get; set; }

    public int User_ID { get; set; }
    public int Role_ID { get; set; }

    [ForeignKey("User_ID")]
    public User User { get; set; }

    [ForeignKey("Role_ID")]
    public Role Role { get; set; }
}
