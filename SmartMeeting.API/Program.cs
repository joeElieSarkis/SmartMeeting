using Microsoft.EntityFrameworkCore;
using SmartMeeting.Application.Services;
using SmartMeeting.Infrastructure.Persistence;
using SmartMeeting.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext with SQL Server provider
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IParticipantService, ParticipantService>();
builder.Services.AddScoped<IMeetingMinutesService, MeetingMinutesService>();
builder.Services.AddScoped<IAttachmentService, AttachmentService>();


// Swagger stuff (already here)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
