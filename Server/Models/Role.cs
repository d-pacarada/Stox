using System.ComponentModel.DataAnnotations;

public class Role
{
    [Key]
    public int Role_ID { get; set; }

    public string Role_Name { get; set; }
}
