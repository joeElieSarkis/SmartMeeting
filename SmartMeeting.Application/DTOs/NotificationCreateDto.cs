using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartMeeting.Application.DTOs
{
    public class NotificationCreateDto
    {
        public int UserId { get; set; }
        public string Type { get; set; } = "Info";
        public string Message { get; set; } = "";
        public int? MeetingId { get; set; }
    }
}
