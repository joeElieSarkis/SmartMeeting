using System;
using System.Collections.Generic;

namespace SmartMeeting.Domain.Entities
{
    public class Attachment
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;

        // Navigation
        public Meeting Meeting { get; set; } = null!;
    }
}

