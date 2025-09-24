using System;

namespace SmartMeeting.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        // Invite | Reschedule | Cancel | ActionItem | MinutesFinalized | Info
        public string Type { get; set; } = "Info";

        public string Message { get; set; } = "";
        public int? MeetingId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }
}
