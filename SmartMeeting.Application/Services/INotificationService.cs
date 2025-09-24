using SmartMeeting.Application.DTOs;

namespace SmartMeeting.Application.Services
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetForUserAsync(int userId, bool unreadOnly = false, int take = 50);
        Task<int> CountUnreadAsync(int userId);
        Task<NotificationDto> CreateAsync(NotificationCreateDto dto);
        Task MarkReadAsync(int id);
        Task MarkAllReadAsync(int userId);
        Task DeleteAsync(int id);
    }
}
