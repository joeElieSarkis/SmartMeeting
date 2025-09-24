using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Domain.Entities;
using SmartMeeting.Infrastructure.Persistence;

namespace SmartMeeting.Infrastructure.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notifications;

        public MeetingService(AppDbContext context, INotificationService notifications)
        {
            _context = context;
            _notifications = notifications;
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

        private async Task EnsureOrganizerCanScheduleAsync(int organizerId)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == organizerId);
            if (user == null)
                throw new ArgumentException("Organizer not found.");

            if (string.Equals(user.Role, "Guest", StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Guests are not allowed to schedule or modify meetings.");
        }

        private async Task NotifyAllAsync(int meetingId, string type, string message)
        {
            var meeting = await _context.Meetings.AsNoTracking().FirstOrDefaultAsync(m => m.Id == meetingId);
            if (meeting == null) return;

            var attendeeIds = await _context.Participants.AsNoTracking()
                .Where(p => p.MeetingId == meetingId)
                .Select(p => p.UserId)
                .ToListAsync();

            attendeeIds.Add(meeting.OrganizerId);
            var uniqueIds = attendeeIds.Distinct().ToList();

            var tasks = uniqueIds.Select(uid =>
                _notifications.CreateAsync(new NotificationCreateDto
                {
                    UserId = uid,
                    Type = type,
                    Message = message,
                    MeetingId = meetingId
                })
            );
            await Task.WhenAll(tasks);
        }

        private static string TimeRangeString(DateTime start, DateTime end)
            => $"{start:yyyy-MM-dd HH:mm}–{end:HH:mm}";

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
            await EnsureOrganizerCanScheduleAsync(dto.OrganizerId);
            ValidateTimes(dto.StartTime, dto.EndTime);

            if (await HasOverlapAsync(dto.RoomId, dto.StartTime, dto.EndTime))
                throw new InvalidOperationException("Room is already booked for the selected time.");

            var meeting = new Meeting
            {
                Title = dto.Title ?? string.Empty,
                Agenda = dto.Agenda ?? string.Empty,
                OrganizerId = dto.OrganizerId,
                RoomId = dto.RoomId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Scheduled" : dto.Status!,
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
            await EnsureOrganizerCanScheduleAsync(dto.OrganizerId);
            ValidateTimes(dto.StartTime, dto.EndTime);

            var meeting = await _context.Meetings.FindAsync(dto.Id);
            if (meeting == null) throw new KeyNotFoundException("Meeting not found");

            if (await HasOverlapAsync(dto.RoomId, dto.StartTime, dto.EndTime, excludeMeetingId: dto.Id))
                throw new InvalidOperationException("Room is already booked for the selected time.");

            // Track changes for notifications
            var changes = new List<string>();
            if (!string.Equals(meeting.Title ?? "", dto.Title ?? "", StringComparison.Ordinal))
                changes.Add($"title “{meeting.Title}” → “{dto.Title}”");
            if ((meeting.Agenda ?? "") != (dto.Agenda ?? ""))
                changes.Add("agenda updated");
            if (meeting.RoomId != dto.RoomId)
                changes.Add($"room #{meeting.RoomId} → #{dto.RoomId}");
            if (meeting.StartTime != dto.StartTime || meeting.EndTime != dto.EndTime)
                changes.Add($"time {TimeRangeString(meeting.StartTime, meeting.EndTime)} → {TimeRangeString(dto.StartTime, dto.EndTime)}");

            var oldStatus = meeting.Status ?? "Scheduled";
            if (!string.IsNullOrWhiteSpace(dto.Status) && !string.Equals(oldStatus, dto.Status, StringComparison.OrdinalIgnoreCase))
                changes.Add($"status {oldStatus} → {dto.Status}");

            // ---- Null-safe assignments (no CS8601) ----
            meeting.Title = string.IsNullOrWhiteSpace(dto.Title) ? (meeting.Title ?? string.Empty) : dto.Title!;
            meeting.Agenda = dto.Agenda ?? (meeting.Agenda ?? string.Empty);
            meeting.OrganizerId = dto.OrganizerId;
            meeting.RoomId = dto.RoomId;
            meeting.StartTime = dto.StartTime;
            meeting.EndTime = dto.EndTime;

            if (!string.IsNullOrWhiteSpace(dto.Status))
                meeting.Status = dto.Status!;
            else
                meeting.Status ??= "Scheduled";

            await _context.SaveChangesAsync();

            if (changes.Count > 0)
            {
                var msg = $"Meeting “{meeting.Title}” updated: {string.Join(", ", changes)}.";
                await NotifyAllAsync(meeting.Id, type: "MeetingUpdated", message: msg);
            }
        }

        public async Task DeleteMeetingAsync(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null) throw new KeyNotFoundException("Meeting not found");

            var msg = $"Meeting “{meeting.Title}” ({TimeRangeString(meeting.StartTime, meeting.EndTime)}) was canceled.";

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();

            await NotifyAllAsync(id, type: "MeetingCanceled", message: msg);
        }
    }
}
