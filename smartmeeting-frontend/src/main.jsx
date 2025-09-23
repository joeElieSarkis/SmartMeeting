import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Login from './App.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CalendarView from './pages/CalendarView.jsx'
import MeetingBooking from './pages/MeetingBooking.jsx'
import ActiveMeeting from './pages/ActiveMeeting.jsx'
import MinutesEditor from './pages/MinutesEditor.jsx'
import MinutesReview from './pages/MinutesReview.jsx'
import AdminRooms from './pages/AdminRooms.jsx'
import './index.css'
import { getUser } from './auth.js'

function RequireAuth({ children }) {
  const user = getUser();
  return user ? children : <Navigate to="/" replace />;
}

// Role gate helper (exact match)
function RequireRole({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  return user.role === role ? children : <Navigate to="/dashboard" replace />;
}

// NEW: disallow a specific role (e.g., Guest)
function RequireNotRole({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  return user.role === role ? <Navigate to="/dashboard" replace /> : children;
}

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/calendar', element: <CalendarView /> },
      { path: '/meetings/book', element: <RequireNotRole role="Guest"><MeetingBooking /></RequireNotRole> },
      { path: '/meetings/active', element: <ActiveMeeting /> },
      { path: '/minutes', element: <MinutesEditor /> },
      { path: '/minutes/review', element: <MinutesReview /> },

      // Admin-only route
      { path: '/admin/rooms', element: <RequireRole role="Admin"><AdminRooms /></RequireRole> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
)
