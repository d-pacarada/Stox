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
    public DbSet<PurchaseInvoice> PurchaseInvoice { get; set; }
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItem { get; set; }
    public DbSet<UserActivityLog> UserActivityLogs { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Existing: Customer -> User cascade
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.User)
            .WithMany(u => u.Customers)
            .HasForeignKey(c => c.User_ID)
            .OnDelete(DeleteBehavior.Cascade);

        // ✅ New: PurchaseInvoice -> PurchaseInvoiceItem cascade
        modelBuilder.Entity<PurchaseInvoice>()
            .HasMany(p => p.PurchaseInvoiceItems)
            .WithOne(i => i.PurchaseInvoice)
            .HasForeignKey(i => i.PurchaseInvoice_ID)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
