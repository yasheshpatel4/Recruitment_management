using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Models;
using System.Text.Json;

namespace RecruitmentSystem.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Check if admin user already exists
            var adminExists = await context.Users.AnyAsync(u => u.Username == "admin");
            
            if (!adminExists)
            {
                var adminUser = new User
                {
                    FullName = "System Administrator",
                    Email = "admin@recruitmentsystem.com",
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Admin" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
