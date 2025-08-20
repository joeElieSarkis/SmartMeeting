using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Domain.Entities;
using SmartMeeting.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartMeeting.Infrastructure.Services
{
    public class MeetingMinutesService : IMeetingMinutesService
    {
        private readonly AppDbContext _context;

        public MeetingMinutesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MeetingMinutesDto?> GetByIdAsync(int id)
        {
            var mm = await _context.MeetingMinutes.FindAsync(id);
            if (mm == null) return null;

            return Map(mm);
        }

        public async Task<IEnumerable<MeetingMinutesDto>> GetAllAsync()
        {
            var list = await _context.MeetingMinutes.AsNoTracking().ToListAsync();
            return list.Select(Map);
        }

        public async Task<IEnumerable<MeetingMinutesDto>> GetByMeetingIdAsync(int meetingId)
        {
            var list = await _context.MeetingMinutes
                .AsNoTracking()
                .Where(x => x.MeetingId == meetingId)
                .ToListAsync();

            return list.Select(Map);
        }

        public async Task<MeetingMinutesDto> CreateAsync(MeetingMinutesCreateDto dto)
        {
            var mm = new MeetingMinutes
            {
                MeetingId = dto.MeetingId,
                Summary = dto.Summary,
                AssignedTo = dto.AssignedTo,
                TaskDescription = dto.TaskDescription,
                TaskStatus = string.IsNullOrWhiteSpace(dto.TaskStatus) ? "Pending" : dto.TaskStatus,
                TaskDueDate = dto.TaskDueDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.MeetingMinutes.Add(mm);
            await _context.SaveChangesAsync();

            return Map(mm);
        }

        public async Task UpdateAsync(MeetingMinutesUpdateDto dto)
        {
            var mm = await _context.MeetingMinutes.FindAsync(dto.Id);
            if (mm == null) throw new KeyNotFoundException("MeetingMinutes not found");

            mm.MeetingId = dto.MeetingId;
            mm.Summary = dto.Summary;
            mm.AssignedTo = dto.AssignedTo;
            mm.TaskDescription = dto.TaskDescription;
            mm.TaskStatus = dto.TaskStatus ?? mm.TaskStatus;
            mm.TaskDueDate = dto.TaskDueDate;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var mm = await _context.MeetingMinutes.FindAsync(id);
            if (mm == null) throw new KeyNotFoundException("MeetingMinutes not found");

            _context.MeetingMinutes.Remove(mm);
            await _context.SaveChangesAsync();
        }

        private static MeetingMinutesDto Map(MeetingMinutes mm) => new MeetingMinutesDto
        {
            Id = mm.Id,
            MeetingId = mm.MeetingId,
            Summary = mm.Summary,
            AssignedTo = mm.AssignedTo,
            TaskDescription = mm.TaskDescription,
            TaskStatus = mm.TaskStatus,
            TaskDueDate = mm.TaskDueDate,
            CreatedAt = mm.CreatedAt
        };
    }
}

