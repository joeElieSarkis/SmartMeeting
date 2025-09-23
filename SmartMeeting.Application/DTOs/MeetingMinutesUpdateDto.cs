namespace SmartMeeting.Application.DTOs
{
    public class MeetingMinutesUpdateDto
    {
        public int Id { get; set; }
        public required int MeetingId { get; set; }
        public required string Summary { get; set; }
        public int? AssignedTo { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskStatus { get; set; }
        public bool? IsFinal { get; set; }
        public DateTime? TaskDueDate { get; set; }
    }
}

