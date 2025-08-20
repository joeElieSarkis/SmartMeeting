using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartMeeting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixRoomRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Meetings_MeetingId1",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Rooms_RoomId",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Rooms_RoomId1",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Users_OrganizerId",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Participants_Meetings_MeetingId1",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_MeetingId1",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_RoomId1",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_MeetingId1",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "MeetingId1",
                table: "Participants");

            migrationBuilder.DropColumn(
                name: "RoomId1",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "MeetingId1",
                table: "Attachments");

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatus",
                table: "MeetingMinutes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskDueDate",
                table: "MeetingMinutes",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "TaskDescription",
                table: "MeetingMinutes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Rooms_RoomId",
                table: "Meetings",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Users_OrganizerId",
                table: "Meetings",
                column: "OrganizerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Rooms_RoomId",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Users_OrganizerId",
                table: "Meetings");

            migrationBuilder.AddColumn<int>(
                name: "MeetingId1",
                table: "Participants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoomId1",
                table: "Meetings",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatus",
                table: "MeetingMinutes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskDueDate",
                table: "MeetingMinutes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskDescription",
                table: "MeetingMinutes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MeetingId1",
                table: "Attachments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participants_MeetingId1",
                table: "Participants",
                column: "MeetingId1");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_RoomId1",
                table: "Meetings",
                column: "RoomId1");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_MeetingId1",
                table: "Attachments",
                column: "MeetingId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Meetings_MeetingId1",
                table: "Attachments",
                column: "MeetingId1",
                principalTable: "Meetings",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Rooms_RoomId",
                table: "Meetings",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Rooms_RoomId1",
                table: "Meetings",
                column: "RoomId1",
                principalTable: "Rooms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Users_OrganizerId",
                table: "Meetings",
                column: "OrganizerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_Meetings_MeetingId1",
                table: "Participants",
                column: "MeetingId1",
                principalTable: "Meetings",
                principalColumn: "Id");
        }
    }
}
