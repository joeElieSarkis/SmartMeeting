import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Login from './App.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
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

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/meetings/book', element: <MeetingBooking /> },
      { path: '/meetings/active', element: <ActiveMeeting /> },
      { path: '/minutes', element: <MinutesEditor /> },
      { path: '/minutes/review', element: <MinutesReview /> },
      { path: '/admin/rooms', element: <AdminRooms /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
)
