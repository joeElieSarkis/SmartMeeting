using SmartMeeting.Application.DTOs;

public interface IMeetingMinutesService
{
    Task<MeetingMinutesDto?> GetByIdAsync(int id);
    Task<IEnumerable<MeetingMinutesDto>> GetAllAsync();
    Task<IEnumerable<MeetingMinutesDto>> GetByMeetingIdAsync(int meetingId);
    Task<MeetingMinutesDto> CreateAsync(MeetingMinutesCreateDto dto);
    Task UpdateAsync(MeetingMinutesUpdateDto dto);
    Task DeleteAsync(int id);

    Task FinalizeAsync(int id); 
}


