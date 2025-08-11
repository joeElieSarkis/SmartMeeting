namespace SmartMeeting.Application.DTOs
{
    public class UserCreateDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? Role { get; set; }
    }
}

