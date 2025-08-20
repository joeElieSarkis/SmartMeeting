using Microsoft.AspNetCore.Mvc;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;

namespace SmartMeeting.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _service;

        public AttachmentsController(IAttachmentService service)
        {
            _service = service;
        }

        // GET: api/attachments
        [HttpGet]
        public async Task<IEnumerable<AttachmentDto>> GetAll()
        {
            return await _service.GetAllAsync();
        }

        // GET: api/attachments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AttachmentDto>> Get(int id)
        {
            var att = await _service.GetByIdAsync(id);
            if (att == null) return NotFound();
            return att;
        }

        // GET: api/attachments/byMeeting/10
        [HttpGet("byMeeting/{meetingId}")]
        public async Task<IEnumerable<AttachmentDto>> GetByMeeting(int meetingId)
        {
            return await _service.GetByMeetingIdAsync(meetingId);
        }

        // POST: api/attachments
        [HttpPost]
        public async Task<ActionResult<AttachmentDto>> Create(AttachmentCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        // PUT: api/attachments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AttachmentUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        // DELETE: api/attachments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}

