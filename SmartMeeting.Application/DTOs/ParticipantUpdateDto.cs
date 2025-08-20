namespace SmartMeeting.Application.DTOs
{
    public class ParticipantUpdateDto
    {
        public int Id { get; set; }
        public required int MeetingId { get; set; }
        public required int UserId { get; set; }
    }
}

