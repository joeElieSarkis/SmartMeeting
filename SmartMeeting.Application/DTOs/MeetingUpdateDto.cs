namespace SmartMeeting.Application.DTOs
{
    public class MeetingUpdateDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Agenda { get; set; } = string.Empty;
        public int OrganizerId { get; set; }
        public int RoomId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Status { get; set; } // optional
    }
}

