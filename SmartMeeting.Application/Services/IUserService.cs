using SmartMeeting.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IUserService
    {
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> CreateUserAsync(UserCreateDto userCreateDto);
        Task UpdateUserAsync(UserUpdateDto userUpdateDto);
        Task DeleteUserAsync(int id);
    }
}


