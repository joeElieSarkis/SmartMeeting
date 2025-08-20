namespace SmartMeeting.Application.DTOs
{
    public class RoomDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Capacity { get; set; }
        public string Location { get; set; } = null!;
        public string? Features { get; set; }
    }
}

