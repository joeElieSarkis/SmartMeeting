namespace SmartMeeting.Application.DTOs
{
    public class MeetingMinutesCreateDto
    {
        public required int MeetingId { get; set; }
        public required string Summary { get; set; }
        public int? AssignedTo { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskStatus { get; set; }   // default handled in entity/service if null
        public DateTime? TaskDueDate { get; set; }
    }
}
