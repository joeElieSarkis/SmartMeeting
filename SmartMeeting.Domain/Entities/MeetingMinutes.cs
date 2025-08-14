using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class MeetingMinutes
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public Meeting Meeting { get; set; } = null!;
        public string Summary { get; set; } = null!;
        public int? AssignedTo { get; set; }      // foreign key
        public User? AssignedToUser { get; set; } = null!;  // navigation property
        public string TaskDescription { get; set; } = null!;
        public string TaskStatus { get; set; } = null!;
        public DateTime TaskDueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
