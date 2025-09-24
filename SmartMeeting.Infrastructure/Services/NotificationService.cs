using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Domain.Entities;
using SmartMeeting.Infrastructure.Persistence;
using System.Linq;

namespace SmartMeeting.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _db;

        public NotificationService(AppDbContext db) => _db = db;

        public async Task<NotificationDto> CreateAsync(NotificationCreateDto dto)
        {
            var n = new Notification
            {
                UserId = dto.UserId,
                Type = dto.Type,
                Message = dto.Message,
                MeetingId = dto.MeetingId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _db.Notifications.Add(n);
            await _db.SaveChangesAsync();

            return new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Type = n.Type,
                Message = n.Message,
                MeetingId = n.MeetingId,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            };
        }

        public async Task<IEnumerable<NotificationDto>> GetForUserAsync(int userId, bool unreadOnly = false, int take = 50)
        {
            // Declare as IQueryable first → then apply OrderBy after optional filters
            IQueryable<Notification> q = _db.Notifications
                .AsNoTracking()
                .Where(x => x.UserId == userId);

            if (unreadOnly)
                q = q.Where(x => !x.IsRead);

            q = q.OrderByDescending(x => x.CreatedAt);

            var list = await q.Take(take).ToListAsync();

            return list.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Type = n.Type,
                Message = n.Message,
                MeetingId = n.MeetingId,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            });
        }

        public Task<int> CountUnreadAsync(int userId) =>
            _db.Notifications
               .AsNoTracking()
               .Where(n => n.UserId == userId && !n.IsRead)
               .CountAsync();

        public async Task MarkReadAsync(int id)
        {
            var n = await _db.Notifications.FindAsync(id);
            if (n == null) return;
            n.IsRead = true;
            await _db.SaveChangesAsync();
        }

        public async Task MarkAllReadAsync(int userId)
        {
            await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        }

        public async Task DeleteAsync(int id)
        {
            var n = await _db.Notifications.FindAsync(id);
            if (n == null) return;
            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();
        }
    }
}
