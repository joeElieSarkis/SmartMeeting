using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingMinutesController : ControllerBase
    {
        private readonly IMeetingMinutesService _service;

        public MeetingMinutesController(IMeetingMinutesService service)
        {
            _service = service;
        }

        // GET: api/meetingminutes
        // GET: api/meetingminutes?meetingId=10
        [HttpGet]
        public async Task<IEnumerable<MeetingMinutesDto>> GetAllOrByQuery([FromQuery] int? meetingId)
        {
            if (meetingId.HasValue)
                return await _service.GetByMeetingIdAsync(meetingId.Value);

            return await _service.GetAllAsync();
        }

        // GET: api/meetingminutes/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<MeetingMinutesDto>> Get(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        // GET: api/meetingminutes/byMeeting/10
        [HttpGet("byMeeting/{meetingId:int}")]
        public async Task<IEnumerable<MeetingMinutesDto>> GetByMeeting(int meetingId)
        {
            return await _service.GetByMeetingIdAsync(meetingId);
        }

        // POST: api/meetingminutes
        [HttpPost]
        public async Task<ActionResult<MeetingMinutesDto>> Create(MeetingMinutesCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        // PUT: api/meetingminutes/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, MeetingMinutesUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        // DELETE: api/meetingminutes/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}

