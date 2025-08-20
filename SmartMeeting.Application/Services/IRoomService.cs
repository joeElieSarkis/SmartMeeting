using SmartMeeting.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IRoomService
    {
        Task<RoomDto?> GetRoomByIdAsync(int id);
        Task<IEnumerable<RoomDto>> GetAllRoomsAsync();
        Task<RoomDto> CreateRoomAsync(RoomCreateDto roomCreateDto);
        Task UpdateRoomAsync(RoomUpdateDto roomUpdateDto);
        Task DeleteRoomAsync(int id);
    }
}

