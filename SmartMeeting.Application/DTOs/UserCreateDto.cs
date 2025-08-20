namespace SmartMeeting.Application.DTOs
{
    public class UserCreateDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; } // plain password, not hashed
        public string? Role { get; set; }
    }
}



