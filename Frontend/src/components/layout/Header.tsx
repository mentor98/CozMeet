import { useState } from 'react'
import {
  Search,
  Home,
  Compass,
  Users,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface HeaderProps {
  currentUser?: Profile
}

export const Header = ({ currentUser }: HeaderProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Users, label: 'People', path: '/people' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-gray shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Logo and Search */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Link
            to="/"
            className="font-black text-2xl text-primary-blue tracking-tight hover:opacity-90 flex-shrink-0"
          >
            CozMeet
          </Link>

          <form onSubmit={handleSearch} className="hidden sm:flex items-center max-w-xs w-full">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search posts or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-border-gray/80 rounded-xl text-xs sm:text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
              />
            </div>
          </form>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-light-blue text-primary-blue shadow-xs'
                    : 'text-secondary-text hover:text-dark-text hover:bg-light-gray'
                }`}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-light-gray transition-colors"
              >
                <Avatar src={currentUser.avatar_url || undefined} size="sm" />
                <span className="hidden md:inline font-bold text-xs sm:text-sm text-dark-text max-w-[120px] truncate">
                  {currentUser.display_name || currentUser.username}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl card shadow-xl py-2 z-50 border border-border-gray animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-border-gray/60 mb-1">
                    <p className="text-xs font-bold text-dark-text truncate">
                      {currentUser.display_name}
                    </p>
                    <p className="text-[11px] text-secondary-text font-mono truncate">
                      @{currentUser.username}
                    </p>
                  </div>

                  <Link
                    to={`/profile/${currentUser.username}`}
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 hover:bg-light-gray text-xs sm:text-sm text-dark-text flex items-center gap-2.5 transition-colors"
                  >
                    <User size={16} className="text-secondary-text" />
                    My Profile
                  </Link>

                  <Link
                    to="/people"
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 hover:bg-light-gray text-xs sm:text-sm text-dark-text flex items-center gap-2.5 transition-colors"
                  >
                    <Users size={16} className="text-secondary-text" />
                    Find Creators
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 hover:bg-light-gray text-xs sm:text-sm text-dark-text flex items-center gap-2.5 transition-colors"
                  >
                    <SettingsIcon size={16} className="text-secondary-text" />
                    Account Settings
                  </Link>

                  <div className="border-t border-border-gray/60 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs sm:text-sm text-red-600 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-xs py-1.5 px-4 rounded-xl">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
