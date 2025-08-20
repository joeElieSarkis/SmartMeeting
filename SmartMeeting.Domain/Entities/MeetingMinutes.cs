using System;

namespace SmartMeeting.Domain.Entities
{
    public class MeetingMinutes
    {
        public int Id { get; set; }

        // FK to Meeting 
        public int MeetingId { get; set; }
        public Meeting Meeting { get; set; } = null!;

        // Summary of the meeting 
        public string Summary { get; set; } = null!;

        // FK to User 
        public int? AssignedTo { get; set; }
        public User? AssignedToUser { get; set; }

        // Task details 
        public string? TaskDescription { get; set; }
        public string? TaskStatus { get; set; } = "Pending"; // default value
        public DateTime? TaskDueDate { get; set; }

        // Creation timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


