import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { CreditCard, FileText, Download, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { plan } = useParams();
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Selected plan details
  const planInfo = {
    silver: { name: 'Silver Lifetime Plan', price: 999 },
    gold: { name: 'Gold Lifetime Plan', price: 2999 },
    diamond: { name: 'Diamond Lifetime Plan', price: 5999 }
  }[plan] || { name: 'Gold Lifetime Plan', price: 2999 };

  useEffect(() => {
    if (!user) {
      toast.info('Please sign in to view checkout.');
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleSimulatePayment = async (status) => {
    if (status === 'fail') {
      toast.error('Payment simulation failed.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create Order on server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      if (!orderRes.ok) throw new Error('Order creation failed');
      const orderData = await orderRes.json();

      // Step 2: Verify payment on server (mock signature verify)
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData.order_id,
          plan: orderData.plan,
          amount: orderData.amount,
          payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10)
        })
      });

      if (!verifyRes.ok) throw new Error('Verification failed');
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        updateSubscription(verifyData.subscription);
        setOrderDetails({
          invoice_no: verifyData.subscription.invoice_no,
          order_id: orderData.order_id,
          payment_id: 'pay_mock_transaction',
          amount: orderData.amount,
          plan: orderData.plan
        });
        setSuccess(true);
        toast.success('Lifetime Subscription Activated! 🎉');
      }
    } catch (err) {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!orderDetails) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

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
      doc.text(`Invoice No: ${orderDetails.invoice_no}`, 150, 26);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 32);

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
      doc.text(`ArkDev Pro Lifetime Access - ${orderDetails.plan.toUpperCase()} Plan`, 20, 103);
      doc.text('1', 110, 103);
      doc.text(`INR ${orderDetails.amount}`, 140, 103);
      doc.text(`INR ${orderDetails.amount}`, 170, 103);

      doc.line(15, 108, 195, 108);

      // Summary / Total
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Grand Total:', 130, 120);
      doc.setTextColor(16, 185, 129); // Green
      doc.setFontSize(12);
      doc.text(`INR ${orderDetails.amount}`, 170, 120);

      // Payment Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text('Transaction Details', 15, 140);
      doc.line(15, 143, 80, 143);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(8.5);
      doc.text(`Payment ID: ${orderDetails.payment_id}`, 15, 150);
      doc.text(`Order ID: ${orderDetails.order_id}`, 15, 156);
      doc.text('Status: PAID / CAPTURED', 15, 162);

      doc.save(`invoice_${orderDetails.invoice_no}.pdf`);
      toast.success('Invoice PDF downloaded.');
    } catch (err) {
      toast.error('Failed to export invoice.');
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '600px', width: '100%', margin: '0 auto', padding: '120px 24px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {!success ? (
          /* Checkout Panel */
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(24px) saturate(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '40px 30px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}>
            <button 
              onClick={() => navigate('/pricing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                marginBottom: '20px'
              }}
            >
              <ArrowLeft size={14} /> Back to plans
            </button>

            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Checkout Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>{planInfo.name}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>One-time pay, lifetime updates</p>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ec4899' }}>
                ₹ {planInfo.price}
              </span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Supported payment options (Razorpay sandbox active)</h4>
            <ul style={{ paddingLeft: '20px', margin: '0 0 30px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              <li>UPI (GPay, PhonePe, Paytm, BHIM)</li>
              <li>Credit Card / Debit Card</li>
              <li>Net Banking / Wallets</li>
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleSimulatePayment('success')}
                disabled={loading}
                style={{
                  background: 'linear-gradient(to right, #6366f1, #a855f7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 20px rgba(99, 102, 241, 0.25)'
                }}
              >
                {loading ? 'Processing Transaction...' : 'Simulate Success Razorpay Payment'}
              </button>

              <button
                onClick={() => handleSimulatePayment('fail')}
                disabled={loading}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Simulate Failed Payment
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen Panel */
          <div style={{
            background: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(24px) saturate(1.2)',
            border: '1px solid #10b981',
            borderRadius: '24px',
            padding: '40px 30px',
            boxShadow: '0 25px 60px -10px rgba(16, 185, 129, 0.15)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#10b981', marginBottom: '15px' }}>
              <CheckCircle size={50} style={{ margin: '0 auto' }} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Payment Successful!</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Thank you! Your lifetime membership for <strong>{orderDetails.plan.toUpperCase()}</strong> has been activated.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Invoice No:</span>
                <strong style={{ color: '#fff' }}>{orderDetails.invoice_no}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Order ID:</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{orderDetails.order_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Amount Paid:</span>
                <strong style={{ color: '#10b981' }}>INR {orderDetails.amount}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleDownloadInvoice}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Download size={16} /> Download Invoice PDF
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
