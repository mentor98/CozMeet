import { useState } from 'react'
import { Search, Home, Compass, MessageSquare, Bell, Users, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface HeaderProps {
  currentUser?: Profile
}

export const Header = ({ currentUser }: HeaderProps) => {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/', active: true },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Users, label: 'People', path: '/people' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border-gray">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo and Search */}
        <div className="flex items-center gap-6 flex-1">
          <Link to="/" className="font-bold text-2xl text-primary-blue">
            CozMeet
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-light-gray border border-border-gray focus:outline-none focus:ring-2 focus:ring-primary-blue w-48"
              />
            </div>
          </form>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-light-blue text-primary-blue'
                    : 'text-secondary-text hover:text-dark-text'
                }`}
              >
                <Icon size={20} />
              </Link>
            )
          })}
        </nav>

        {/* Right: Profile and Actions */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Avatar src={currentUser.avatar_url || undefined} size="sm" />
                <span className="hidden md:inline font-medium text-sm">
                  {currentUser.username}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white card shadow-lg py-2">
                  <Link
                    to={`/profile/${currentUser.username}`}
                    className="block px-4 py-2 hover:bg-light-gray text-sm"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-light-gray text-sm"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-light-gray text-sm flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
