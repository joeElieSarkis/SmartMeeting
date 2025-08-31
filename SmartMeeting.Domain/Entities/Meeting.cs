using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Meeting
    {
        public int Id { get; set; }

        // Required fields
        public string Title { get; set; } = null!;
        public string? Agenda { get; set; }  // nullable if some meetings may not have an agenda

        // Foreign keys
        public int OrganizerId { get; set; }
        public int RoomId { get; set; }

        // Meeting schedule
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Status with default
        public string Status { get; set; } = "Scheduled";

        // Record creation timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Organizer { get; set; } = null!;
        public Room Room { get; set; } = null!;
        public ICollection<Participant> Participants { get; set; } = new List<Participant>();
        public ICollection<MeetingMinutes> MeetingMinutes { get; set; } = new List<MeetingMinutes>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    }
}



