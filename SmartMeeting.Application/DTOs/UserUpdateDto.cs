﻿namespace SmartMeeting.Application.DTOs
{
    public class UserUpdateDto
    {
        public int Id { get; set; }

        public required string Email { get; set; }
        public required string PasswordHash { get; set; }

    }
}




