namespace SmartMeeting.Application.DTOs
{
    public class MeetingCreateDto
    {
        public string Title { get; set; } = null!;
        public string Agenda { get; set; } = string.Empty;
        public int OrganizerId { get; set; }
        public int RoomId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Status { get; set; } // optional, default to "Scheduled"
    }
}


