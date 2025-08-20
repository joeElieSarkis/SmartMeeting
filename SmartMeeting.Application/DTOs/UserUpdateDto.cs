namespace SmartMeeting.Application.DTOs
{
    public class UserUpdateDto
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; } // plain password
        public string? Name { get; set; }
        public string? Role { get; set; }
    }
}






