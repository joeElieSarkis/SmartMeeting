namespace SmartMeeting.Domain.Entities
{
    public class MeetingMinutes
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public Meeting Meeting { get; set; } = null!;
        public string Summary { get; set; } = null!;
        public int? AssignedTo { get; set; }
        public User? AssignedToUser { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskStatus { get; set; } = "Pending";
        public DateTime? TaskDueDate { get; set; }

        public bool IsFinal { get; set; } = false;        

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}



