using SmartMeeting.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IAttachmentService
    {
        Task<AttachmentDto?> GetByIdAsync(int id);
        Task<IEnumerable<AttachmentDto>> GetAllAsync();
        Task<IEnumerable<AttachmentDto>> GetByMeetingIdAsync(int meetingId);
        Task<AttachmentDto> CreateAsync(AttachmentCreateDto dto);
        Task UpdateAsync(AttachmentUpdateDto dto);
        Task DeleteAsync(int id);
    }
}
