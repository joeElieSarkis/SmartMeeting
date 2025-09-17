using SmartMeeting.Domain.Entities;
using BCrypt.Net;

namespace SmartMeeting.Infrastructure.Persistence
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            if (!db.Users.Any())
            {
                db.Users.Add(new User
                {
                    Name = "Admin",
                    Email = "admin@smartmeeting.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (!db.Rooms.Any())
            {
                db.Rooms.AddRange(
                    new Room { Name = "Room A", Capacity = 8, Location = "1st Floor", Features = "TV,HDMI" },
                    new Room { Name = "Room B", Capacity = 12, Location = "2nd Floor", Features = "Whiteboard" }
                );
            }

            await db.SaveChangesAsync();
        }
    }
}
