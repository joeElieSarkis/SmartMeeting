namespace SmartMeeting.Application.DTOs
{
    public class AttachmentDto
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
    }
}

