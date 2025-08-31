using SmartMeeting.Application.DTOs;
using System.Threading.Tasks;

namespace SmartMeeting.Application.Services
{
    public interface IAuthService
    {
        Task<UserDto?> AuthenticateAsync(string email, string password);
    }
}

