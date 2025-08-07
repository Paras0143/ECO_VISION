import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Report from './pages/Report'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Notification from './components/Notification'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen font-body text-gray-800 overflow-x-hidden relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-hero-pattern opacity-30 pointer-events-none z-0"></div>
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<Report />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
              </Routes>
              <Notification />
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
