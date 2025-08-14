using Microsoft.EntityFrameworkCore;
using SmartMeeting.Domain.Entities;

namespace SmartMeeting.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<Meeting> Meetings { get; set; } = null!;
        public DbSet<Participant> Participants { get; set; } = null!;
        public DbSet<MeetingMinutes> MeetingMinutes { get; set; } = null!;
        public DbSet<Attachment> Attachments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Make Email unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Meeting relationships
            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.Organizer)
                .WithMany(u => u.OrganizedMeetings)
                .HasForeignKey(m => m.OrganizerId);

            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.Room)
                .WithMany()
                .HasForeignKey(m => m.RoomId);

            // Participant relationships
            modelBuilder.Entity<Participant>()
                .HasOne(p => p.Meeting)
                .WithMany()
                .HasForeignKey(p => p.MeetingId);

            // Participant → User (no cascade delete)
            modelBuilder.Entity<Participant>()
                .HasOne(p => p.User)
                .WithMany(u => u.Participations )
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // MeetingMinutes relationships
            modelBuilder.Entity<MeetingMinutes>()
                .HasOne(mm => mm.Meeting)
                .WithMany(m => m.MeetingMinutes) 
                .HasForeignKey(mm => mm.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

            // MeetingMinutes → AssignedToUser (User)
            modelBuilder.Entity<MeetingMinutes>()
                .HasOne(mm => mm.AssignedToUser)
                .WithMany(u => u.AssignedMeetingMinutes)
                .HasForeignKey(mm => mm.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict); 


            // Attachment relationships
            modelBuilder.Entity<Attachment>()
                .HasOne(a => a.Meeting)
                .WithMany()
                .HasForeignKey(a => a.MeetingId);
        }
    }
}
