using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Participant
    {
        public int Id { get; set; }

        // Foreign Keys
        public int MeetingId { get; set; }
        public int UserId { get; set; }

        //Navigation Properties
        public Meeting Meeting { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}

