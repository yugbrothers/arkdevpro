import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Bookmark, Sparkles, Film, Tv, PlayCircle, Flame, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext/AuthContext';

export default function AvatarNavbar({ onSearchClick, activeTab, setActiveTab, myListCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '0 40px',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        background: scrolled
          ? 'rgba(11, 15, 25, 0.92)'
          : 'linear-gradient(180deg, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0) 100%)',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 40px rgba(0, 0, 0, 0.8)' : 'none'
      }}
    >
      {/* Brand & Main Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <Link
          to="/visual-avatar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(to right, #ffffff, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}
            >
              VISUAL AVATAR
            </span>
            <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Cinematic Stream
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'all', label: 'Home', icon: Flame },
            { id: 'movies', label: 'Movies', icon: Film },
            { id: 'series', label: 'Series', icon: Tv },
            { id: 'new', label: 'New Releases', icon: Sparkles },
            { id: 'mylist', label: `My List (${myListCount})`, icon: Bookmark }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <IconComp size={15} color={isActive ? '#c084fc' : '#94a3b8'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search trigger button */}
        <button
          onClick={onSearchClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Search size={15} color="#c084fc" />
          <span>Search Avatars...</span>
          <kbd style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>⌘K</kbd>
        </button>

        {/* Home Back button */}
        <Link
          to="/"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          Main Site
        </Link>

        {/* Profile Avatar / Menu */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src={user.avatar_url}
                alt={user.username}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '2px solid #a855f7',
                  objectFit: 'cover'
                }}
              />
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '180px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '8px',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                  zIndex: 2000
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{user.username}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    marginTop: '4px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/signin"
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
