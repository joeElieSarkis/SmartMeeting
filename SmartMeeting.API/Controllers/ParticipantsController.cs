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

        [HttpGet]
        public async Task<IEnumerable<ParticipantDto>> GetParticipants()
        {
            return await _participantService.GetAllParticipantsAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ParticipantDto>> GetParticipant(int id)
        {
            var participant = await _participantService.GetParticipantByIdAsync(id);
            if (participant == null) return NotFound();
            return participant;
        }

        [HttpPost]
        public async Task<ActionResult<ParticipantDto>> CreateParticipant(ParticipantCreateDto dto)
        {
            var participant = await _participantService.CreateParticipantAsync(dto);
            return CreatedAtAction(nameof(GetParticipant), new { id = participant.Id }, participant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParticipant(int id, ParticipantUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _participantService.UpdateParticipantAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            await _participantService.DeleteParticipantAsync(id);
            return NoContent();
        }
    }
}
