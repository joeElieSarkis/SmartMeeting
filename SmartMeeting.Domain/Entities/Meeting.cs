using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Meeting
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Agenda { get; set; } = string.Empty;
        public int OrganizerId { get; set; }       // FK
        public int RoomId { get; set; }            // FK
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Organizer { get; set; } = null!;
        public Room Room { get; set; } = null!;
        public ICollection<Participant> Participants { get; set; } = new List<Participant>();
        public ICollection<MeetingMinutes> MeetingMinutes { get; set; } = new List<MeetingMinutes>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    }
}


