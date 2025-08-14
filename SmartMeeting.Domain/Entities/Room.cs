using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Capacity { get; set; }
        public string Location { get; set; } = null!;
        public string Features { get; set; } = string.Empty;

        // Navigation
        public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
    }
}

