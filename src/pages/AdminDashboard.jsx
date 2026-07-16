import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { toast } from 'sonner';
import { LuUsers, LuTrendingUp, LuDownload, LuCreditCard, LuLayers } from 'react-icons/lu';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Administrator privileges required.');
      navigate('/');
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          toast.error('Failed to load telemetry stats.');
        }
      } catch (err) {
        toast.error('Server error fetching telemetry.');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, [user, authLoading, navigate]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500 }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (loadingStats || !stats) {
    return (
      <div style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500 }}>Loading SaaS telemetry charts...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-gradient-dark)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '120px 24px 60px' }} className="animate-slide-up">
        
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center' }}>
            <LuLayers size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>SaaS Admin Telemetry</h2>
            <p style={{ color: 'var(--text-dimmed)', fontSize: '13px', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Real-time revenue, users growth, and telemetry downloads.</p>
          </div>
        </div>

        {/* Dashboard Cards Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }} className="admin-cards-grid">
          
          {/* Card: Users */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-dimmed)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>{stats.totalUsers}</h3>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
              <LuUsers size={20} />
            </div>
          </div>

          {/* Card: Revenue */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-dimmed)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>₹ {stats.totalRevenue}</h3>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
              <LuTrendingUp size={20} />
            </div>
          </div>

          {/* Card: Downloads */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-dimmed)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component Downloads</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>{stats.totalDownloads}</h3>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <LuDownload size={20} />
            </div>
          </div>

        </div>

        {/* Charts & Graphs (Sleek Visual Renderers) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }} className="admin-charts-grid">
          
          {/* Revenue and Plan distribution */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Active Subscriptions Plan Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.planStats.map(stat => {
                const totalSubs = stats.planStats.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percentage = Math.round((stat.count / totalSubs) * 100);
                const color = { silver: '#94a3b8', gold: '#eab308', diamond: '#ec4899' }[stat.plan] || '#fff';
                
                return (
                  <div key={stat.plan}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-secondary)' }}>{stat.plan} ({stat.count} users)</span>
                      <strong style={{ color }}>{percentage}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component telemetry statistics */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Most Downloaded Components</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.popularComponents.map((comp, idx) => {
                const maxVal = stats.popularComponents[0]?.count || 1;
                const percentage = Math.round((comp.count / maxVal) * 100);
                
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{comp.component_name}</span>
                      <strong style={{ color: 'var(--color-accent)' }}>{comp.count} times</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* User registers & payments list tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="admin-tables-grid">
          
          {/* Recent Payments */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '24px',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
              <LuCreditCard size={16} /> Recent Purchases
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-secondary)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.01)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-secondary)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>Plan</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((pay, idx) => {
                    const planColor = { silver: '#94a3b8', gold: '#eab308', diamond: '#ec4899' }[pay.plan] || '#fff';
                    return (
                      <tr key={idx} style={{ borderBottom: idx === stats.recentPayments.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pay.username}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dimmed)' }}>{pay.email}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            fontSize: '9px',
                            color: planColor,
                            background: `rgba(${pay.plan === 'gold' ? '234, 179, 8' : pay.plan === 'diamond' ? '236, 72, 153' : '148, 163, 184'}, 0.08)`,
                            border: `1px solid rgba(${pay.plan === 'gold' ? '234, 179, 8' : pay.plan === 'diamond' ? '236, 72, 153' : '148, 163, 184'}, 0.2)`,
                            padding: '2px 8px',
                            borderRadius: '9999px'
                          }}>
                            {pay.plan}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 600 }}>₹{pay.amount}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{new Date(pay.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations */}
          <div style={{
            background: 'var(--glass-bg-dark)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border-dark)',
            borderRadius: '12px',
            padding: '24px',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }} className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
              <LuUsers size={16} /> New User Registrations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.recentUsers.map((u, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>{u.username}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-dimmed)', display: 'block' }}>{u.email}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .admin-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .admin-charts-grid,
          .admin-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .admin-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
