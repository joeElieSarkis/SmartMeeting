using SmartMeeting.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IParticipantService
    {
        Task<ParticipantDto?> GetParticipantByIdAsync(int id);
        Task<IEnumerable<ParticipantDto>> GetAllParticipantsAsync();
        Task<ParticipantDto> CreateParticipantAsync(ParticipantCreateDto dto);
        Task UpdateParticipantAsync(ParticipantUpdateDto dto);
        Task DeleteParticipantAsync(int id);
    }
}

