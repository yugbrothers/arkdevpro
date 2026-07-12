import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { LuDownload, LuFileText, LuUser, LuCreditCard, LuSettings, LuArrowRight, LuCalendar } from 'react-icons/lu';

export default function ProfilePage() {
  const { user, subscription, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState({ downloads: [], loginHistory: [], invoices: [] });
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [activeTab, setActiveTab] = useState('downloads'); // 'downloads', 'billing', 'settings'

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch('/api/profile/details');
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (err) {
        toast.error('Failed to load profile details.');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [user, authLoading, navigate]);

  const handleDownloadInvoice = (invoice) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Accent color: Deep Indigo
      const primaryColor = [99, 102, 241];
      const darkBg = [11, 15, 25];

      // Draw Header
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, 210, 45, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('ArkDev Pro', 15, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Premium Developer Assets & UI Kits', 15, 30);

      // Invoice Header Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('INVOICE', 150, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Invoice No: ${invoice.invoice_no}`, 150, 26);
      doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 150, 32);

      // Bill To section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('BILL TO:', 15, 60);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(`Customer Name: ${user.username}`, 15, 66);
      doc.text(`Email Address: ${user.email}`, 15, 72);

      // Invoice Items Table Header
      doc.setFillColor(243, 244, 246);
      doc.rect(15, 85, 180, 10, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(9);
      doc.text('Item Description', 20, 91);
      doc.text('Qty', 110, 91);
      doc.text('Price', 140, 91);
      doc.text('Total', 170, 91);

      // Line item divider
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 95, 195, 95);

      // Table Row
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(`ArkDev Pro Lifetime Access - ${invoice.plan.toUpperCase()} Plan`, 20, 103);
      doc.text('1', 110, 103);
      doc.text(`${invoice.currency} ${invoice.amount}`, 140, 103);
      doc.text(`${invoice.currency} ${invoice.amount}`, 170, 103);

      doc.line(15, 108, 195, 108);

      // Summary / Total
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Grand Total:', 130, 120);
      doc.setTextColor(16, 185, 129); // Green
      doc.setFontSize(12);
      doc.text(`${invoice.currency} ${invoice.amount}`, 170, 120);

      // Payment Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text('Transaction Details', 15, 140);
      doc.line(15, 143, 80, 143);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(8.5);
      doc.text(`Payment ID: ${invoice.payment_id}`, 15, 150);
      doc.text(`Order ID: ${invoice.order_id}`, 15, 156);
      doc.text('Status: PAID / CAPTURED', 15, 162);

      // Footer notice
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(156, 163, 175);
      doc.text('Thank you for choosing ArkDev Pro. If you have any inquiries, email us at support@arkdevpro.com', 15, 200);

      doc.save(`invoice_${invoice.invoice_no}.pdf`);
      toast.success('Invoice downloaded successfully.');
    } catch (err) {
      toast.error('Failed to generate PDF invoice.');
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '120px 24px 60px' }}>
        
        {/* User Info Header Card */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.45)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '30px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src={user.avatar_url} alt={user.username} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{user.username}</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>{user.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span className={`nav-sub-badge ${subscription ? subscription.plan : 'free'}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                  {subscription ? `${subscription.plan.toUpperCase()} Member` : 'Free Tier'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LuCalendar size={13} /> Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#ef4444'; }}
          >
            Sign Out Account
          </button>
        </div>

        {/* Tab Selection Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }} className="profile-layout-responsive">
          
          {/* Side Tabs Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={() => setActiveTab('downloads')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'downloads' ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activeTab === 'downloads' ? '#6366f1' : '#94a3b8',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LuDownload size={16} /> Downloads ({details.downloads.length})
            </button>

            <button 
              onClick={() => setActiveTab('billing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'billing' ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activeTab === 'billing' ? '#6366f1' : '#94a3b8',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LuCreditCard size={16} /> Billing Invoices ({details.invoices.length})
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'settings' ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activeTab === 'settings' ? '#6366f1' : '#94a3b8',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LuSettings size={16} /> Account Security
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(24px) saturate(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            {activeTab === 'downloads' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Your Recent Component Downloads</h3>
                {loadingDetails ? (
                  <p>Loading downloads...</p>
                ) : details.downloads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>No downloads recorded yet.</p>
                    <p style={{ fontSize: '13px', marginTop: '6px' }}>Start browsing components to build your UI kit!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {details.downloads.map((dl, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                      }}>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '14px' }}>{dl.component_name}</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            IP: {dl.ip_address} | Browser: {dl.browser.slice(0, 20)}...
                          </p>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(dl.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Billing Statements</h3>
                {loadingDetails ? (
                  <p>Loading invoices...</p>
                ) : details.invoices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>No purchase records found.</p>
                    <button 
                      onClick={() => navigate('/pricing')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Browse Lifetime Plans <LuArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {details.invoices.map((inv, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#fff', fontSize: '15px', textTransform: 'capitalize' }}>
                              {inv.plan} Subscription
                            </strong>
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                              Paid
                            </span>
                          </div>
                          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            Invoice: {inv.invoice_no} | Date: {new Date(inv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
                            {inv.currency} {inv.amount}
                          </span>
                          <button 
                            onClick={() => handleDownloadInvoice(inv)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s'
                            }}
                            title="Download Invoice PDF"
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          >
                            <LuDownload size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>OAuth Account & Login Security</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', color: '#fff' }}>Primary Authentication method</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>OAuth account tied to your profile</span>
                    </div>
                    <span style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', textTransform: 'capitalize' }}>
                      GitHub Connect
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Recent Logins (Telemetry)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {details.loginHistory.map((hist, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}>
                          <span style={{ color: '#94a3b8' }}>IP: {hist.ip_address} | {hist.browser.slice(0, 30)}...</span>
                          <span style={{ color: '#64748b' }}>{new Date(hist.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <style>{`
        @media (max-width: 768px) {
          .profile-layout-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
