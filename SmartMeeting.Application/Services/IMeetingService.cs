using SmartMeeting.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IMeetingService
    {
        Task<MeetingDto?> GetMeetingByIdAsync(int id);
        Task<IEnumerable<MeetingDto>> GetAllMeetingsAsync();
        Task<MeetingDto> CreateMeetingAsync(MeetingCreateDto dto);
        Task UpdateMeetingAsync(MeetingUpdateDto dto);
        Task DeleteMeetingAsync(int id);
    }
}

