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
    public class ParticipantService : IParticipantService
    {
        private readonly AppDbContext _context;

        public ParticipantService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ParticipantDto?> GetParticipantByIdAsync(int id)
        {
            var participant = await _context.Participants.FindAsync(id);
            if (participant == null) return null;

            return new ParticipantDto
            {
                Id = participant.Id,
                MeetingId = participant.MeetingId,
                UserId = participant.UserId
            };
        }

        public async Task<IEnumerable<ParticipantDto>> GetAllParticipantsAsync()
        {
            var participants = await _context.Participants.ToListAsync();
            return participants.Select(p => new ParticipantDto
            {
                Id = p.Id,
                MeetingId = p.MeetingId,
                UserId = p.UserId
            });
        }

        // NEW: filter by meetingId
        public async Task<IEnumerable<ParticipantDto>> GetByMeetingIdAsync(int meetingId)
        {
            var participants = await _context.Participants
                .AsNoTracking()
                .Where(p => p.MeetingId == meetingId)
                .ToListAsync();

            return participants.Select(p => new ParticipantDto
            {
                Id = p.Id,
                MeetingId = p.MeetingId,
                UserId = p.UserId
            });
        }

        public async Task<ParticipantDto> CreateParticipantAsync(ParticipantCreateDto dto)
        {
            var participant = new Participant
            {
                MeetingId = dto.MeetingId,
                UserId = dto.UserId
            };

            _context.Participants.Add(participant);
            await _context.SaveChangesAsync();

            return new ParticipantDto
            {
                Id = participant.Id,
                MeetingId = participant.MeetingId,
                UserId = participant.UserId
            };
        }

        public async Task UpdateParticipantAsync(ParticipantUpdateDto dto)
        {
            var participant = await _context.Participants.FindAsync(dto.Id);
            if (participant == null) throw new KeyNotFoundException("Participant not found");

            participant.MeetingId = dto.MeetingId;
            participant.UserId = dto.UserId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteParticipantAsync(int id)
        {
            var participant = await _context.Participants.FindAsync(id);
            if (participant == null) throw new KeyNotFoundException("Participant not found");

            _context.Participants.Remove(participant);
            await _context.SaveChangesAsync();
        }
    }
}


