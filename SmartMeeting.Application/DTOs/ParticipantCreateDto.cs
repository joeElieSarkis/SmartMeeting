namespace SmartMeeting.Application.DTOs
{
    public class ParticipantCreateDto
    {
        public required int MeetingId { get; set; }
        public required int UserId { get; set; }
    }
}

