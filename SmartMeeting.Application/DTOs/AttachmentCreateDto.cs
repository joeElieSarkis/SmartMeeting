namespace SmartMeeting.Application.DTOs
{
    public class AttachmentCreateDto
    {
        public required int MeetingId { get; set; }
        public required string FileName { get; set; }
        public required string FilePath { get; set; }
    }
}

