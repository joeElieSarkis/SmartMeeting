using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartMeeting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsFinalToMeetingMinutes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFinal",
                table: "MeetingMinutes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFinal",
                table: "MeetingMinutes");
        }
    }
}
