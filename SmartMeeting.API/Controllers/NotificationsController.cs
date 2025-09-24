using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _svc;

        public NotificationsController(INotificationService svc) => _svc = svc;

        // GET api/notifications/user/5?unreadOnly=true&take=20
        [HttpGet("user/{userId}")]
        public Task<IEnumerable<NotificationDto>> GetForUser(int userId, [FromQuery] bool unreadOnly = false, [FromQuery] int take = 50)
            => _svc.GetForUserAsync(userId, unreadOnly, Math.Clamp(take, 1, 200));

        [HttpGet("user/{userId}/unreadCount")]
        public Task<int> CountUnread(int userId) => _svc.CountUnreadAsync(userId);

        // POST api/notifications
        [HttpPost]
        public async Task<ActionResult<NotificationDto>> Create(NotificationCreateDto dto)
        {
            var n = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetForUser), new { userId = n.UserId }, n);
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkRead(int id) { await _svc.MarkReadAsync(id); return NoContent(); }

        [HttpPost("user/{userId}/readAll")]
        public async Task<IActionResult> MarkAllRead(int userId) { await _svc.MarkAllReadAsync(userId); return NoContent(); }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) { await _svc.DeleteAsync(id); return NoContent(); }
    }
}
