using System.IO;
using Microsoft.AspNetCore.Http;
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

        // --- Swagger-friendly upload form model ---
        public class AttachmentUploadForm
        {
            public int MeetingId { get; set; }
            public IFormFile File { get; set; } = default!;
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

        // POST: api/attachments/upload
        // ✅ FIX: wrap fields in a form model + specify Consumes
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(50_000_000)] // ~50MB
        public async Task<ActionResult<AttachmentDto>> Upload([FromForm] AttachmentUploadForm form)
        {
            if (form.File == null || form.File.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // Ensure folder exists under wwwroot so UseStaticFiles serves /uploads/*
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsDir);

            // Unique filename to avoid collisions
            var safeName = Path.GetFileName(form.File.FileName);
            var unique = $"{Guid.NewGuid():n}_{safeName}";
            var savedPath = Path.Combine(uploadsDir, unique);

            using (var stream = new FileStream(savedPath, FileMode.Create))
            {
                await form.File.CopyToAsync(stream);
            }

            // Public URL (served by UseStaticFiles)
            var publicPath = $"/uploads/{unique}";

            var created = await _service.CreateAsync(new AttachmentCreateDto
            {
                MeetingId = form.MeetingId,
                FileName = safeName,
                FilePath = publicPath
            });

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
