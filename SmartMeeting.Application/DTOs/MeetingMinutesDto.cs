namespace SmartMeeting.Application.DTOs
{
    public class MeetingMinutesDto
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string Summary { get; set; } = null!;
        public int? AssignedTo { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskStatus { get; set; }
        public DateTime? TaskDueDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

