using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Infrastructure.Persistence;

namespace SmartMeeting.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _ctx;
        public AuthService(AppDbContext ctx) => _ctx = ctx;

        public async Task<UserDto?> AuthenticateAsync(string email, string password)
        {
            var user = await _ctx.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;

            var ok = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!ok) return null;

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}

