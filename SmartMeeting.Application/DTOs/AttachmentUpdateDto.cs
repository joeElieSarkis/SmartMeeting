namespace SmartMeeting.Application.DTOs
{
    public class AttachmentUpdateDto
    {
        public int Id { get; set; }
        public required int MeetingId { get; set; }
        public required string FileName { get; set; }
        public required string FilePath { get; set; }
    }
}
