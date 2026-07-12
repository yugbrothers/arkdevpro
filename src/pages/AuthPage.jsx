import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { FaGithub, FaGitlab, FaBitbucket, FaReddit } from 'react-icons/fa';
import { toast } from 'sonner';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
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
      background: '#0b0f19',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
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
      }}>
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
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '20px',
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Join the future of rapid UI development.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '30px' }}>
              Create stunning, modern, and fluid interfaces for your clients and SaaS projects. Access hundreds of modular components, assets, animations, and templates.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['Vercel Integration', 'React & Tailwind', 'Lifetime Updates', '99.9% Uptime'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  fontWeight: 500
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right panel: Login card */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(24px) saturate(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
              Sign In to ArkDev Pro
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              Authenticate securely using your git or social providers.
            </p>

            {/* OAuth Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <button 
                onClick={() => handleOAuthClick('github')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                className="oauth-btn"
              >
                <FaGithub size={18} /> GitHub
              </button>
              
              <button 
                onClick={() => handleOAuthClick('gitlab')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                className="oauth-btn"
              >
                <FaGitlab size={18} color="#fc6d26" /> GitLab
              </button>

              <button 
                onClick={() => handleOAuthClick('bitbucket')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                className="oauth-btn"
              >
                <FaBitbucket size={18} color="#0052cc" /> Bitbucket
              </button>

              <button 
                onClick={() => handleOAuthClick('reddit')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                className="oauth-btn"
              >
                <FaReddit size={18} color="#ff4500" /> Reddit
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: '#64748b' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Developer Testing Bypass</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Developer Testing Bypass Panel */}
            {showDeveloperBypass && (
              <form onSubmit={handleBypassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Test Username</label>
                  <input 
                    type="text" 
                    value={devName} 
                    onChange={e => setDevName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Test Email</label>
                  <input 
                    type="email" 
                    value={devEmail} 
                    onChange={e => setDevEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In as Mock User'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Styles for responsive auth grid */}
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
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.15) !important;
        }
      `}</style>
    </div>
  );
}
