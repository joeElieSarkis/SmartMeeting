using SmartMeeting.Application.Services;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using SmartMeeting.Domain.Entities;

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
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return users.Select(user => new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        public async Task<UserDto> CreateUserAsync(UserCreateDto userCreateDto)
        {
            var user = new User
            {
                Name = userCreateDto.Name,
                Email = userCreateDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userCreateDto.Password), // hash here
                Role = string.IsNullOrEmpty(userCreateDto.Role) ? "Employee" : userCreateDto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task UpdateUserAsync(UserUpdateDto userUpdateDto)
        {
            var user = await _context.Users.FindAsync(userUpdateDto.Id);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.Email = userUpdateDto.Email;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userUpdateDto.Password); // hash again

            if (!string.IsNullOrEmpty(userUpdateDto.Name))
                user.Name = userUpdateDto.Name;

            if (!string.IsNullOrEmpty(userUpdateDto.Role))
                user.Role = userUpdateDto.Role;

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

