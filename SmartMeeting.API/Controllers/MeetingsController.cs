using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingsController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        // GET: api/meetings/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMeeting(int id)
        {
            var meeting = await _meetingService.GetMeetingByIdAsync(id);
            if (meeting == null) return NotFound();
            return Ok(meeting);
        }

        // GET: api/meetings
        [HttpGet]
        public async Task<IActionResult> GetAllMeetings()
        {
            var meetings = await _meetingService.GetAllMeetingsAsync();
            return Ok(meetings);
        }

        // POST: api/meetings
        [HttpPost]
        public async Task<IActionResult> CreateMeeting([FromBody] MeetingCreateDto dto)
        {
            try
            {
                var createdMeeting = await _meetingService.CreateMeetingAsync(dto);
                return CreatedAtAction(nameof(GetMeeting), new { id = createdMeeting.Id }, createdMeeting);
            }
            catch (UnauthorizedAccessException ex)
            {
                // guest trying to schedule
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // overlap: "Room is already booked for the selected time."
                return Conflict(new { message = ex.Message }); // 409
            }
            catch (ArgumentException ex)
            {
                // e.g. "End time must be after start time." or "Organizer not found."
                return BadRequest(new { message = ex.Message }); // 400
            }
        }

        // PUT: api/meetings/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeeting(int id, [FromBody] MeetingUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest(new { message = "ID mismatch" });

            try
            {
                await _meetingService.UpdateMeetingAsync(dto);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // overlap
                return Conflict(new { message = ex.Message }); // 409
            }
            catch (ArgumentException ex)
            {
                // invalid time range
                return BadRequest(new { message = ex.Message }); // 400
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE: api/meetings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            try
            {
                await _meetingService.DeleteMeetingAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
