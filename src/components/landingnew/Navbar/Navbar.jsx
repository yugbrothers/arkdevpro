import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useStars } from '../../../hooks/useStars';
import { GITHUB_URL } from '../../../constants/Site';
import { FaGithub } from 'react-icons/fa6';
import { LuSearch, LuHeart, LuUser, LuLogOut, LuSettings } from 'react-icons/lu';
import { useSearch } from '../../context/SearchContext/useSearch';
import { useOptions } from '../../context/OptionsContext/useOptions';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { CATEGORIES } from '../../../constants/Categories';
import { TOOLS } from '../../../constants/Tools';
import jsIcon from '../../../assets/icons/js.svg';
import tsIcon from '../../../assets/icons/ts.svg';
import cssIcon from '../../../assets/icons/css.svg';
import twIcon from '../../../assets/icons/tw.svg';
import ElectricBorder from '../../../content/Animations/ElectricBorder/ElectricBorder';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Browse', to: '/', match: '/categories' },
  { label: 'Showcase', to: '/showcase', match: '/showcase' },
  { label: 'Tools', to: '/tools', match: '/tools' },
  { label: 'Pricing', to: '/pricing', match: '/pricing' },
];

const activeUsersList = [4, 6, 8, 10, 15, 20, 32, 48, 57, 61, 74, 89, 95, 110];

const Navbar = ({ showDocs }) => {
  const stars = useStars();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(32);
  const linksRef = useRef(null);
  const highlightRef = useRef(null);
  const prefsTimeoutRef = useRef(null);

  const { user, subscription, logout } = useAuth();
  const { toggleSearch } = useSearch();
  const { languagePreset, setLanguagePreset, stylePreset, setStylePreset } = useOptions();
  const location = useLocation();

  const isActive = useCallback((match) => {
    if (match === '/') return location.pathname === '/';
    return location.pathname.startsWith(match);
  }, [location.pathname]);

  // Live Active Users simulation (alternates low & high like a heartbeat every 10 seconds)
  useEffect(() => {
    let isHigh = true;
    const interval = setInterval(() => {
      if (isHigh) {
        // High range: 75 to 125
        const highVal = Math.floor(Math.random() * 51) + 75;
        setActiveUsers(highVal);
      } else {
        // Low range: 6 to 18
        const lowVal = Math.floor(Math.random() * 13) + 6;
        setActiveUsers(lowVal);
      }
      isHigh = !isHigh;
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const positionHighlight = useCallback((el) => {
    const highlight = highlightRef.current;
    const container = linksRef.current;
    if (!highlight || !container || !el) return;
    const linkRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    highlight.style.width = `${linkRect.width}px`;
    highlight.style.height = `${linkRect.height}px`;
    highlight.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
    highlight.style.opacity = '1';
  }, []);

  const getActiveEl = useCallback(() => {
    const container = linksRef.current;
    if (!container) return null;
    return container.querySelector('.ln-navbar-link-active');
  }, []);

  const handleLinkHover = useCallback((e) => {
    positionHighlight(e.currentTarget);
  }, [positionHighlight]);

  const handleLinksLeave = useCallback(() => {
    const activeEl = getActiveEl();
    if (activeEl) {
      positionHighlight(activeEl);
    } else {
      const highlight = highlightRef.current;
      if (highlight) highlight.style.opacity = '0';
    }
  }, [positionHighlight, getActiveEl]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const activeEl = getActiveEl();
      if (activeEl) positionHighlight(activeEl);
    });
  }, [location.pathname, positionHighlight, getActiveEl]);

  const formattedStars = useMemo(() =>
    stars >= 1000 ? `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}k` : stars,
    [stars]
  );

  const handlePrefsEnter = useCallback(() => {
    if (prefsTimeoutRef.current) clearTimeout(prefsTimeoutRef.current);
    setPrefsOpen(true);
  }, []);

  const handlePrefsLeave = useCallback(() => {
    prefsTimeoutRef.current = setTimeout(() => setPrefsOpen(false), 200);
  }, []);

  const subBadgeClass = useMemo(() => {
    if (!subscription) return 'free';
    return subscription.plan;
  }, [subscription]);

  const subBadgeLabel = useMemo(() => {
    if (!subscription) return 'Free';
    return subscription.plan;
  }, [subscription]);

  return (
    <header className={`ln-navbar${scrolled ? ' ln-navbar-scrolled' : ''}${showDocs ? ' ln-navbar-docs' : ''}`} style={{
      backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
      background: scrolled ? 'rgba(11, 15, 25, 0.75)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
      boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.7)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="ln-navbar-inner" style={{ border: 'none', background: 'transparent' }}>
        <div className="ln-navbar-left">
          <Link to="/" className="ln-navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ArkDev Pro
            </span>
          </Link>

          <span className="ln-navbar-divider">/</span>

          <nav className="ln-navbar-links" ref={linksRef} onMouseLeave={handleLinksLeave}>
            <div className="ln-navbar-link-highlight" ref={highlightRef} />
            {NAV_LINKS.map(({ label, to, match }) => (
              <Link key={to} className={`ln-navbar-link${isActive(match) ? ' ln-navbar-link-active' : ''}`} to={to} onMouseEnter={handleLinkHover}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ln-navbar-right">
          {/* Active Users Telemetry Dot */}
          <div className="active-users-badge" title="Live active users connected">
            <span className="pulsing-dot" />
            <span>{activeUsers} Active</span>
          </div>

          {showDocs && (
            <button className="ln-navbar-icon-btn ln-navbar-search-btn" onClick={toggleSearch} aria-label="Search">
              <LuSearch size={15} />
              <span className="ln-navbar-search-text">Search...</span>
              <kbd className="ln-navbar-kbd">/</kbd>
            </button>
          )}

          {/* User Section */}
          {user ? (
            <div
              className="ln-navbar-prefs-wrapper"
              onMouseEnter={handlePrefsEnter}
              onMouseLeave={handlePrefsLeave}
            >
              <div className="nav-user-profile">
                <img src={user.avatar_url} alt={user.username} className="nav-user-avatar" />
                <span className="nav-user-name show-desktop">{user.username.split(' ')[0]}</span>
                <span className={`nav-sub-badge ${subBadgeClass}`}>{subBadgeLabel}</span>
              </div>

              {prefsOpen && (
                <div className="ln-navbar-prefs-menu" style={{ width: '200px' }}>
                  <span className="ln-navbar-prefs-label">Settings</span>
                  <Link to="/profile" className="ln-navbar-prefs-fav" onClick={() => setPrefsOpen(false)}>
                    <LuUser size={14} /> Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="ln-navbar-prefs-fav" onClick={() => setPrefsOpen(false)}>
                      <LuSettings size={14} /> Admin panel
                    </Link>
                  )}
                  <div className="ln-navbar-prefs-divider" />
                  
                  {/* Presets settings (language preset toggle) */}
                  <span className="ln-navbar-prefs-label">Prefs</span>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <button className={`ln-navbar-toggle-item${languagePreset === 'JS' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLanguagePreset('JS')}>
                      JS
                    </button>
                    <button className={`ln-navbar-toggle-item${languagePreset === 'TS' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLanguagePreset('TS')}>
                      TS
                    </button>
                  </div>
                  
                  <div className="ln-navbar-prefs-divider" />
                  
                  <button className="ln-navbar-prefs-fav" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { logout(); setPrefsOpen(false); }}>
                    <LuLogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="ln-navbar-link" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
                Sign In
              </Link>
              <ElectricBorder color="#ec4899" speed={1.2} chaos={0.08} borderRadius={10} style={{ display: 'inline-block' }}>
                <Link to="/pricing" style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'block'
                }}>
                  Get Lifetime Access
                </Link>
              </ElectricBorder>
            </>
          )}

          <a
            className="ln-navbar-github show-desktop"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={16} color="#fff" />
            <span>{formattedStars}</span>
          </a>

          <button
            className={`ln-navbar-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="ln-navbar-mobile-menu">
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={to} className="ln-navbar-mobile-link" to={to} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link className="ln-navbar-mobile-link" to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link className="ln-navbar-mobile-link" to="/admin" onClick={() => setMenuOpen(false)}>
                    Admin panel
                  </Link>
                )}
                <button className="ln-navbar-mobile-link" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { logout(); setMenuOpen(false); }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link className="ln-navbar-mobile-link" to="/signin" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link className="ln-navbar-mobile-link" to="/pricing" onClick={() => setMenuOpen(false)} style={{ color: '#ec4899', fontWeight: 'bold' }}>
                  Get Lifetime Access
                </Link>
              </>
            )}
            
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ln-navbar-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaGithub size={14} /> GitHub
              </span>
              <span style={{ opacity: 0.6 }}>{formattedStars}</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;