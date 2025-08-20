using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.Services;
using SmartMeeting.Application.DTOs;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        // GET: api/rooms
        [HttpGet]
        public async Task<IEnumerable<RoomDto>> GetRooms()
        {
            return await _roomService.GetAllRoomsAsync();
        }

        // GET: api/rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoom(int id)
        {
            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null) return NotFound();
            return room;
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<ActionResult<RoomDto>> CreateRoom(RoomCreateDto roomCreateDto)
        {
            var room = await _roomService.CreateRoomAsync(roomCreateDto);
            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room);
        }

        // PUT: api/rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, RoomUpdateDto roomUpdateDto)
        {
            if (id != roomUpdateDto.Id) return BadRequest();

            var existingRoom = await _roomService.GetRoomByIdAsync(id);
            if (existingRoom == null) return NotFound();

            await _roomService.UpdateRoomAsync(roomUpdateDto);
            return NoContent();
        }

        // DELETE: api/rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var existingRoom = await _roomService.GetRoomByIdAsync(id);
            if (existingRoom == null) return NotFound();

            await _roomService.DeleteRoomAsync(id);
            return NoContent();
        }
    }
}
