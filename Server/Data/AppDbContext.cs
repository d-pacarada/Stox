using Microsoft.EntityFrameworkCore;
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


}
