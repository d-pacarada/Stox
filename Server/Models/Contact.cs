namespace Server.Models
{
    public class Contact
    {
        public int Contact_ID { get; set; }
        public string Email { get; set; }
        public string Message { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
