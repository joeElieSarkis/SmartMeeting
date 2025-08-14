using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "Employee";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Meeting> OrganizedMeetings { get; set; } = new List<Meeting>();
        public ICollection<Participant> Participations { get; set; } = new List<Participant>();
        public ICollection<MeetingMinutes> AssignedMeetingMinutes { get; set; } = new List<MeetingMinutes>();
    }
}




