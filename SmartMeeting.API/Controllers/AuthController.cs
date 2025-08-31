using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto dto)
        {
            var user = await _auth.AuthenticateAsync(dto.Email, dto.Password);
            if (user == null) return Unauthorized();
            return Ok(user); // later you can return a JWT here
        }
    }
}
