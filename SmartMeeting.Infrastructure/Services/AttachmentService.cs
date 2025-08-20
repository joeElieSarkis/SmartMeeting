using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.DTOs;
using SmartMeeting.Application.Services;
using SmartMeeting.Domain.Entities;
using SmartMeeting.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartMeeting.Infrastructure.Services
{
    public class AttachmentService : IAttachmentService
    {
        private readonly AppDbContext _context;

        public AttachmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AttachmentDto?> GetByIdAsync(int id)
        {
            var att = await _context.Attachments.FindAsync(id);
            if (att == null) return null;

            return Map(att);
        }

        public async Task<IEnumerable<AttachmentDto>> GetAllAsync()
        {
            var list = await _context.Attachments.AsNoTracking().ToListAsync();
            return list.Select(Map);
        }

        public async Task<IEnumerable<AttachmentDto>> GetByMeetingIdAsync(int meetingId)
        {
            var list = await _context.Attachments
                .AsNoTracking()
                .Where(a => a.MeetingId == meetingId)
                .ToListAsync();

            return list.Select(Map);
        }

        public async Task<AttachmentDto> CreateAsync(AttachmentCreateDto dto)
        {
            var att = new Attachment
            {
                MeetingId = dto.MeetingId,
                FileName = dto.FileName,
                FilePath = dto.FilePath
            };

            _context.Attachments.Add(att);
            await _context.SaveChangesAsync();

            return Map(att);
        }

        public async Task UpdateAsync(AttachmentUpdateDto dto)
        {
            var att = await _context.Attachments.FindAsync(dto.Id);
            if (att == null) throw new KeyNotFoundException("Attachment not found");

            att.MeetingId = dto.MeetingId;
            att.FileName = dto.FileName;
            att.FilePath = dto.FilePath;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var att = await _context.Attachments.FindAsync(id);
            if (att == null) throw new KeyNotFoundException("Attachment not found");

            _context.Attachments.Remove(att);
            await _context.SaveChangesAsync();
        }

        private static AttachmentDto Map(Attachment a) => new AttachmentDto
        {
            Id = a.Id,
            MeetingId = a.MeetingId,
            FileName = a.FileName,
            FilePath = a.FilePath
        };
    }
}

