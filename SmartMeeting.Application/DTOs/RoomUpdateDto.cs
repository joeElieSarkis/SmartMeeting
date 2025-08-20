namespace SmartMeeting.Application.DTOs
{
    public class RoomUpdateDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required int Capacity { get; set; }
        public required string Location { get; set; }
        public string? Features { get; set; }
    }
}

