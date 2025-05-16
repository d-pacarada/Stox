using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class UserActivityLog
{
    [Key]
    public int LogId { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }

    public string Action { get; set; }

    public DateTime Timestamp { get; set; }
}
