import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, MessageCircle, AlertTriangle, User, Activity, Sun, Moon } from 'lucide-react'
import './Layout.css'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/emergency', icon: AlertTriangle, label: 'SOS' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Layout({ theme, toggleTheme }) {
  const location = useLocation()

  return (
    <div className="layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-group">
            <div className="logo-icon">
              <Activity size={22} />
            </div>
            <div className="logo-text">
              <span className="logo-name">ArogyaMitra</span>
              <span className="logo-tag">AI Health Assistant</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="header-status">
              <span className="status-dot"></span>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-inner">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''} ${path === '/emergency' ? 'nav-item--sos' : ''}`
              }
              end={path === '/'}
            >
              <div className="nav-icon-wrap">
                <Icon size={20} />
                {path === '/emergency' && (
                  <span className="sos-pulse"></span>
                )}
              </div>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
