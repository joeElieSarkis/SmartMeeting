namespace SmartMeeting.Application.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = "Info";
        public string Message { get; set; } = "";
        public int? MeetingId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}
