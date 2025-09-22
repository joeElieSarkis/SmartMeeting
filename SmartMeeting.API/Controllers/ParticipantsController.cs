using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParticipantsController : ControllerBase
    {
        private readonly IParticipantService _participantService;

        public ParticipantsController(IParticipantService participantService)
        {
            _participantService = participantService;
        }

        // GET: api/participants
        [HttpGet]
        public async Task<IEnumerable<ParticipantDto>> GetParticipants()
        {
            return await _participantService.GetAllParticipantsAsync();
        }

        // GET: api/participants/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ParticipantDto>> GetParticipant(int id)
        {
            var participant = await _participantService.GetParticipantByIdAsync(id);
            if (participant == null) return NotFound();
            return participant;
        }

        // NEW: Get all participants for a specific meeting
        // GET: api/participants/byMeeting/{meetingId}
        [HttpGet("byMeeting/{meetingId}")]
        public async Task<IEnumerable<ParticipantDto>> GetParticipantsByMeeting(int meetingId)
        {
            return await _participantService.GetByMeetingIdAsync(meetingId);
        }

        // POST: api/participants
        [HttpPost]
        public async Task<ActionResult<ParticipantDto>> CreateParticipant(ParticipantCreateDto dto)
        {
            var participant = await _participantService.CreateParticipantAsync(dto);
            return CreatedAtAction(nameof(GetParticipant), new { id = participant.Id }, participant);
        }

        // PUT: api/participants/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParticipant(int id, ParticipantUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _participantService.UpdateParticipantAsync(dto);
            return NoContent();
        }

        // DELETE: api/participants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            await _participantService.DeleteParticipantAsync(id);
            return NoContent();
        }
    }
}

