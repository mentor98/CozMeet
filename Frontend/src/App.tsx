import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { Header } from '@/components/layout/Header'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'
import { Explore } from '@/pages/Explore'

function App() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {profile && <Header currentUser={profile} />}
      <Routes>
        <Route path="/" element={profile ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!profile ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!profile ? <Register /> : <Navigate to="/" />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/settings" element={profile ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Router>
  )
}

export default App
