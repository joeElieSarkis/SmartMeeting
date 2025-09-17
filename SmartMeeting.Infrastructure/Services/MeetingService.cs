using SmartMeeting.Application.Services;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Infrastructure.Persistence;
using SmartMeeting.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SmartMeeting.Infrastructure.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly AppDbContext _context;

        public MeetingService(AppDbContext context)
        {
            _context = context;
        }

        // ---- Helpers ----
        private static void ValidateTimes(DateTime start, DateTime end)
        {
            if (end <= start)
                throw new ArgumentException("End time must be after start time.");
        }

        private Task<bool> HasOverlapAsync(int roomId, DateTime start, DateTime end, int? excludeMeetingId = null)
        {
            // Overlap rule: (A.start < B.end) && (B.start < A.end)
            var query = _context.Meetings.AsNoTracking().Where(m =>
                m.RoomId == roomId &&
                m.StartTime < end &&
                start < m.EndTime
            );

            if (excludeMeetingId.HasValue)
                query = query.Where(m => m.Id != excludeMeetingId.Value);

            return query.AnyAsync();
        }

        // ---- Queries ----
        public async Task<MeetingDto?> GetMeetingByIdAsync(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null) return null;

            return new MeetingDto
            {
                Id = meeting.Id,
                Title = meeting.Title ?? string.Empty,
                Agenda = meeting.Agenda ?? string.Empty,
                OrganizerId = meeting.OrganizerId,
                RoomId = meeting.RoomId,
                StartTime = meeting.StartTime,
                EndTime = meeting.EndTime,
                Status = meeting.Status ?? "Scheduled",
                CreatedAt = meeting.CreatedAt
            };
        }

        public async Task<IEnumerable<MeetingDto>> GetAllMeetingsAsync()
        {
            var meetings = await _context.Meetings.AsNoTracking().ToListAsync();
            return meetings.Select(m => new MeetingDto
            {
                Id = m.Id,
                Title = m.Title ?? string.Empty,
                Agenda = m.Agenda ?? string.Empty,
                OrganizerId = m.OrganizerId,
                RoomId = m.RoomId,
                StartTime = m.StartTime,
                EndTime = m.EndTime,
                Status = m.Status ?? "Scheduled",
                CreatedAt = m.CreatedAt
            });
        }

        // ---- Commands ----
        public async Task<MeetingDto> CreateMeetingAsync(MeetingCreateDto dto)
        {
            // 1) Validate requested time range
            ValidateTimes(dto.StartTime, dto.EndTime);

            // 2) Prevent double booking in the same room
            if (await HasOverlapAsync(dto.RoomId, dto.StartTime, dto.EndTime))
                throw new InvalidOperationException("Room is already booked for the selected time.");

            var meeting = new Meeting
            {
                Title = dto.Title,
                Agenda = dto.Agenda,
                OrganizerId = dto.OrganizerId,
                RoomId = dto.RoomId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = string.IsNullOrEmpty(dto.Status) ? "Scheduled" : dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            return new MeetingDto
            {
                Id = meeting.Id,
                Title = meeting.Title ?? string.Empty,
                Agenda = meeting.Agenda ?? string.Empty,
                OrganizerId = meeting.OrganizerId,
                RoomId = meeting.RoomId,
                StartTime = meeting.StartTime,
                EndTime = meeting.EndTime,
                Status = meeting.Status ?? "Scheduled",
                CreatedAt = meeting.CreatedAt
            };
        }

        public async Task UpdateMeetingAsync(MeetingUpdateDto dto)
        {
            // 1) Validate requested time range
            ValidateTimes(dto.StartTime, dto.EndTime);

            var meeting = await _context.Meetings.FindAsync(dto.Id);
            if (meeting == null) throw new KeyNotFoundException("Meeting not found");

            // 2) Prevent double booking (exclude the current meeting)
            if (await HasOverlapAsync(dto.RoomId, dto.StartTime, dto.EndTime, excludeMeetingId: dto.Id))
                throw new InvalidOperationException("Room is already booked for the selected time.");

            meeting.Title = dto.Title;
            meeting.Agenda = dto.Agenda;
            meeting.OrganizerId = dto.OrganizerId;
            meeting.RoomId = dto.RoomId;
            meeting.StartTime = dto.StartTime;
            meeting.EndTime = dto.EndTime;

            if (!string.IsNullOrEmpty(dto.Status))
                meeting.Status = dto.Status;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteMeetingAsync(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null) throw new KeyNotFoundException("Meeting not found");

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();
        }
    }
}
