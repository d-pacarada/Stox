using Microsoft.EntityFrameworkCore;
using Server.Controllers;
using Server.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> User { get; set; }
    public DbSet<Role> Role { get; set; }
    public DbSet<UserRole> UserRole { get; set; }
    public DbSet<Contact> Contact { get; set; }
    public DbSet<Category> Category { get; set; }
    public DbSet<Product> Product { get; set; }
    public DbSet<Customer> Customer { get; set; } 
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<Invoice> Invoice { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>()
            .HasOne(c => c.User)
            .WithMany(u => u.Customers)
            .HasForeignKey(c => c.User_ID)
            .OnDelete(DeleteBehavior.Cascade);

    }
}
