import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { toast } from 'sonner';
import { LuUsers, LuTrendingUp, LuDownload, LuShieldAlert, LuCreditCard, LuLayers } from 'react-icons/lu';

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
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (loadingStats || !stats) {
    return (
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading SaaS telemetry charts...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '120px 24px 60px' }}>
        
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <LuLayers size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>SaaS Admin Telemetry</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Real-time revenue, users growth, and telemetry downloads.</p>
          </div>
        </div>

        {/* Dashboard Cards Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }} className="admin-cards-grid">
          
          {/* Card: Users */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '8px 0 0 0' }}>{stats.totalUsers}</h3>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '12px', borderRadius: '14px' }}>
              <LuUsers size={22} />
            </div>
          </div>

          {/* Card: Revenue */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', margin: '8px 0 0 0' }}>₹ {stats.totalRevenue}</h3>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '14px' }}>
              <LuTrendingUp size={22} />
            </div>
          </div>

          {/* Card: Downloads */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component Downloads</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '8px 0 0 0' }}>{stats.totalDownloads}</h3>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#fff', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <LuDownload size={22} />
            </div>
          </div>

        </div>

        {/* Charts & Graphs (Sleek Visual Renderers) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '40px' }} className="admin-charts-grid">
          
          {/* Revenue and Plan distribution */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Active Subscriptions Plan Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.planStats.map(stat => {
                const totalSubs = stats.planStats.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percentage = Math.round((stat.count / totalSubs) * 100);
                const color = { silver: '#94a3b8', gold: '#eab308', diamond: '#ec4899' }[stat.plan] || '#fff';
                
                return (
                  <div key={stat.plan}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{stat.plan} ({stat.count} users)</span>
                      <strong style={{ color }}>{percentage}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component telemetry statistics */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Most Downloaded Components</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.popularComponents.map((comp, idx) => {
                const maxVal = stats.popularComponents[0]?.count || 1;
                const percentage = Math.round((comp.count / maxVal) * 100);
                
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>{comp.component_name}</span>
                      <strong>{comp.count} times</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* User registers & payments list tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }} className="admin-tables-grid">
          
          {/* Recent Payments */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LuCreditCard size={18} /> Recent Purchases
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '10px 6px', color: '#64748b' }}>Customer</th>
                    <th style={{ padding: '10px 6px', color: '#64748b' }}>Plan</th>
                    <th style={{ padding: '10px 6px', color: '#64748b' }}>Amount</th>
                    <th style={{ padding: '10px 6px', color: '#64748b' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((pay, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 6px' }}>
                        <div style={{ fontWeight: 600 }}>{pay.username}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{pay.email}</div>
                      </td>
                      <td style={{ padding: '12px 6px', textTransform: 'uppercase', fontWeight: 700, fontSize: '11px' }}>{pay.plan}</td>
                      <td style={{ padding: '12px 6px', color: '#10b981', fontWeight: 600 }}>INR {pay.amount}</td>
                      <td style={{ padding: '12px 6px', color: '#94a3b8' }}>{new Date(pay.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LuUsers size={18} /> New User Registrations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentUsers.map((u, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '14px' }}>{u.username}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{u.email}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
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
