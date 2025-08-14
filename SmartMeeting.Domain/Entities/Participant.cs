using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Participant
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public int UserId { get; set; }

        // Navigation
        public Meeting Meeting { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}

