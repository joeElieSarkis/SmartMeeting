using SmartMeeting.Application.Services;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Infrastructure.Persistence; // for AppDbContext
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace SmartMeeting.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email
                // map other properties if needed
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return users.Select(user => new UserDto
            {
                Id = user.Id,
                Email = user.Email
                // map other properties
            });
        }

        public async Task<UserDto> CreateUserAsync(UserCreateDto userCreateDto)
        {
            var user = new Domain.Entities.User
            {
                Email = userCreateDto.Email,
                PasswordHash = userCreateDto.PasswordHash
                // set other properties
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email
            };
        }

        public async Task UpdateUserAsync(UserUpdateDto userUpdateDto)
        {
            var user = await _context.Users.FindAsync(userUpdateDto.Id);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.Email = userUpdateDto.Email;
            user.PasswordHash = userUpdateDto.PasswordHash;
            // update other properties if any

            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new KeyNotFoundException("User not found");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
