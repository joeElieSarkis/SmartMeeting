using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Infrastructure.Persistence;
using SmartMeeting.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartMeeting.Infrastructure.Services
{
    public class RoomService : IRoomService
    {
        private readonly AppDbContext _context;

        public RoomService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RoomDto?> GetRoomByIdAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return null;

            return new RoomDto
            {
                Id = room.Id,
                Name = room.Name,
                Capacity = room.Capacity,
                Location = room.Location,
                Features = room.Features
            };
        }

        public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
        {
            var rooms = await _context.Rooms.ToListAsync();
            return rooms.Select(room => new RoomDto
            {
                Id = room.Id,
                Name = room.Name,
                Capacity = room.Capacity,
                Location = room.Location,
                Features = room.Features
            });
        }

        public async Task<RoomDto> CreateRoomAsync(RoomCreateDto roomCreateDto)
        {
            var room = new Room
            {
                Name = roomCreateDto.Name,
                Capacity = roomCreateDto.Capacity,
                Location = roomCreateDto.Location,
                Features = roomCreateDto.Features ?? string.Empty
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return new RoomDto
            {
                Id = room.Id,
                Name = room.Name,
                Capacity = room.Capacity,
                Location = room.Location,
                Features = room.Features
            };
        }

        public async Task UpdateRoomAsync(RoomUpdateDto roomUpdateDto)
        {
            var room = await _context.Rooms.FindAsync(roomUpdateDto.Id);
            if (room == null) throw new KeyNotFoundException("Room not found");

            room.Name = roomUpdateDto.Name;
            room.Capacity = roomUpdateDto.Capacity;
            room.Location = roomUpdateDto.Location;
            room.Features = roomUpdateDto.Features ?? string.Empty;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteRoomAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) throw new KeyNotFoundException("Room not found");

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
        }
    }
}

