# SmartMeeting

Smart Meeting Room & Minutes Management System built with **ASP.NET Core**, **React**, and **Clean Architecture**.

## 🚀 Features
- **User Management**: Role-based access (Admin, Employee, Guest)
- **Room Management**: Create, edit, and delete meeting rooms with capacity, location, and features
- **Booking System**: Book rooms with real-time availability and prevent double-booking
- **Meeting Setup**: Schedule meetings with agenda, attendees, and invitations
- **Minutes of Meeting (MoM)**: Record discussions, decisions, and action items; assign responsibilities
- **Attachments**: Upload and manage supporting files
- **Notifications**: In-app alerts for invitations and updates
- **Dashboard & Reports**: Track meetings, room usage, and activity (basic version)

## 🛠️ Tech Stack
- **Backend**: ASP.NET Core (.NET 7), Entity Framework Core, SQL Server
- **Frontend**: React.js, Vite, React Router
- **Architecture**: Clean Architecture with Domain, Application, Infrastructure, and API layers
- **Auth**: JWT-based authentication & authorization
- **Other**: BCrypt password hashing, RESTful APIs

## 📂 Project Structure
- **Domain**: Core business logic and entities
- **Application**: Services, DTOs, and use cases
- **Infrastructure**: Database context, repositories, persistence
- **API**: Controllers and HTTP endpoints (REST APIs)
- **Frontend**: React application (src/pages, src/api, src/auth)

## ▶️ Getting Started

### Prerequisites
- [.NET 7 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/7.0)
- [Node.js & npm](https://nodejs.org/)
- SQL Server

### Backend Setup
```bash
cd SmartMeeting.Api
dotnet restore
dotnet run 
```
### Frontend Setup
```bash
cd smartmeeting-frontend
npm install
npm run dev
```

The app will be available at:

- **API** → http://localhost:5114  
- **Frontend** → http://localhost:5173  

## 📜 License
This project is for educational purposes (internship project).
