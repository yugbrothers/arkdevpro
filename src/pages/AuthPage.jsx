import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { FaGithub, FaGitlab, FaBitbucket, FaReddit, FaGoogle } from 'react-icons/fa';
import { toast } from 'sonner';

export default function AuthPage() {
  console.log('AuthPage: rendering component');

  const { login } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('AuthPage: component successfully mounted');
  }, []);

  // States for simulated local dev bypass login
  const [showDeveloperBypass, setShowDeveloperBypass] = useState(true);
  const [devName, setDevName] = useState('John Doe');
  const [devEmail, setDevEmail] = useState('john@doe.dev');
  const [loading, setLoading] = useState(false);

  const handleOAuthClick = async (provider) => {
    setLoading(true);
    // Simulate OAuth redirect or mock sign in with random credentials
    const defaultEmails = {
      github: `${provider}_user@github.com`,
      gitlab: `${provider}_user@gitlab.com`,
      bitbucket: `${provider}_user@bitbucket.com`,
      reddit: `${provider}_user@reddit.com`,
      google: `${provider}_user@gmail.com`,
    };
    
    const result = await login(`OAuth Developer (${provider})`, defaultEmails[provider], provider);
    setLoading(false);
    
    if (result.success) {
      toast.success(`Welcome! Logged in via ${provider.toUpperCase()}`);
      navigate('/');
    } else {
      toast.error(result.error || 'Failed to log in');
    }
  };

  const handleBypassSubmit = async (e) => {
    e.preventDefault();
    if (!devName || !devEmail) {
      toast.error('Please provide name and email.');
      return;
    }
    
    setLoading(true);
    const result = await login(devName, devEmail, 'github');
    setLoading(false);
    
    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/');
    } else {
      toast.error(result.error || 'Failed to log in');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-gradient-dark)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glow matching XFINITY ERP login overlay */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(0,0,0,0) 70%)',
        top: '-10%',
        left: '25%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Navbar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 60px',
        zIndex: 1
      }} className="animate-slide-up">
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }} className="auth-grid-responsive">
          
          {/* Left panel: Illustration / Promo */}
          <div style={{ paddingRight: '20px' }} className="auth-left-promo">
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '20px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Join the future of rapid UI development.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '30px', fontFamily: 'var(--font-sans)' }}>
              Create stunning, modern, and fluid interfaces for your clients and SaaS projects. Access hundreds of modular components, assets, animations, and templates.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['Vercel Integration', 'React & Tailwind', 'Lifetime Updates', '99.9% Uptime'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-secondary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right panel: Login card styled as ERP glass panel */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '32px 28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }} className="glass-panel">
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Sign In to ArkDev Pro
            </h3>
            <p style={{ color: 'var(--text-dimmed)', fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--font-sans)' }}>
              Authenticate securely using your git or social providers.
            </p>

            {/* OAuth Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => handleOAuthClick('github')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s'
                }}
                className="oauth-btn"
              >
                <FaGithub size={16} /> GitHub
              </button>
              
              <button 
                onClick={() => handleOAuthClick('gitlab')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s'
                }}
                className="oauth-btn"
              >
                <FaGitlab size={16} color="#fc6d26" /> GitLab
              </button>

              <button 
                onClick={() => handleOAuthClick('bitbucket')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s'
                }}
                className="oauth-btn"
              >
                <FaBitbucket size={16} color="#0052cc" /> Bitbucket
              </button>

              <button 
                onClick={() => handleOAuthClick('reddit')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s'
                }}
                className="oauth-btn"
              >
                <FaReddit size={16} color="#ff4500" /> Reddit
              </button>

              <button 
                onClick={() => handleOAuthClick('google')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s',
                  gridColumn: 'span 2'
                }}
                className="oauth-btn"
              >
                <FaGoogle size={16} color="#ea4335" /> Google / Gmail
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0', color: 'var(--text-dimmed)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-secondary)' }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Developer Bypass</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-secondary)' }} />
            </div>

            {/* Developer Testing Bypass Panel */}
            {showDeveloperBypass && (
              <form onSubmit={handleBypassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Test Username</label>
                  <input 
                    type="text" 
                    value={devName} 
                    onChange={e => setDevName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }} 
                    className="auth-input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Test Email</label>
                  <input 
                    type="email" 
                    value={devEmail} 
                    onChange={e => setDevEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }} 
                    className="auth-input-field"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    marginTop: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}
                  className="auth-submit-btn"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Mock User'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Styles for responsive auth grid and transitions */}
      <style>{`
        @media (max-width: 768px) {
          .auth-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .auth-left-promo {
            text-align: center !important;
            padding-right: 0 !important;
          }
        }
        .oauth-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
        }
        .auth-input-field:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3) !important;
        }
        .auth-submit-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}
