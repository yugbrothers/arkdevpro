import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext/AuthContext';
import Navbar from '../components/landingnew/Navbar/Navbar';
import Footer from '../components/landingnew/Footer/Footer';
import { LuCheck, LuArrowRight } from 'react-icons/lu';
import { toast } from 'sonner';
import ElectricBorder from '../content/Animations/ElectricBorder/ElectricBorder';

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    if (!user) {
      toast.info('Please sign in to select a plan and proceed to checkout.');
      navigate(`/signin?redirect=/checkout/${planId}`);
    } else {
      navigate(`/checkout/${planId}`);
    }
  };

  const plans = [
    {
      id: 'silver',
      name: 'Silver',
      price: '999',
      features: [
        'Browse Components',
        'Basic Templates',
        'Community Support',
        'Lifetime Access'
      ],
      color: '#94a3b8',
      popular: false
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '2999',
      features: [
        'Everything in Silver',
        'Premium Components',
        'Priority Support',
        'Exclusive Templates',
        'New Releases'
      ],
      color: '#eab308',
      popular: false
    },
    {
      id: 'diamond',
      name: 'Diamond',
      price: '5999',
      features: [
        'Everything Included',
        'Unlimited Downloads',
        'Premium Assets',
        'VIP Support',
        'Future Updates',
        'Commercial License'
      ],
      color: '#ec4899',
      popular: true
    }
  ];

  return (
    <div style={{ background: 'var(--bg-gradient-dark)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '120px 24px 80px', position: 'relative' }} className="animate-slide-up">
        
        {/* Background ambient lighting */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%)',
          top: '30%',
          right: '-10%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '60px', zIndex: 1, position: 'relative' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '15px',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Lifetime Pricing Plans
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
            No subscriptions. Pay once, use forever. Scale your UI projects with zero monthly commitments.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          alignItems: 'stretch',
          zIndex: 1,
          position: 'relative'
        }} className="pricing-grid-responsive">
          
          {plans.map(plan => (
            <div 
              key={plan.id}
              style={{
                background: 'var(--glass-bg-dark)',
                backdropFilter: 'blur(16px)',
                border: plan.popular ? '2px solid #ec4899' : '1px solid var(--glass-border-dark)',
                borderRadius: 'var(--radius-md)',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: plan.popular 
                  ? '0 20px 40px rgba(236, 72, 153, 0.15), 0 0 30px rgba(236,72,153,0.08)' 
                  : '0 15px 30px rgba(0,0,0,0.3)',
                transform: plan.popular ? 'scale(1.02)' : 'none',
                transition: 'all 0.3s ease'
              }}
              className={`pricing-card glass-panel ${plan.popular ? 'popular-glow-card' : ''}`}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-13px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(to right, #ec4899, #a855f7)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
                  fontFamily: 'var(--font-sans)'
                }}>
                  Most Popular Plan
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{plan.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', margin: '20px 0', fontFamily: 'var(--font-sans)' }}>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-dimmed)', marginRight: '4px' }}>₹</span>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dimmed)', marginLeft: '6px', fontWeight: 500 }}>One-time pay</span>
                </div>

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '20px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: plan.popular ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.02)',
                        color: plan.popular ? '#ec4899' : 'var(--text-muted)',
                        border: plan.popular ? '1px solid rgba(236,72,153,0.15)' : '1px solid var(--border-primary)'
                      }}>
                        <LuCheck size={10} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.popular ? (
                <ElectricBorder color="#ec4899" speed={1.2} chaos={0.08} borderRadius={6} style={{ marginTop: '30px', width: '100%' }}>
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 14px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '13px',
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Choose {plan.name} <LuArrowRight size={13} />
                  </button>
                </ElectricBorder>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    color: '#fff',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    marginTop: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  className="plan-select-btn"
                >
                  Choose {plan.name} <LuArrowRight size={13} />
                </button>
              )}
            </div>
          ))}

        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .pricing-grid-responsive {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
          .pricing-card {
            transform: none !important;
          }
        }
        @media (max-width: 768px) {
          .pricing-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        .pricing-card:hover {
          border-color: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-2px) !important;
        }
        .popular-glow-card:hover {
          border-color: #ec4899 !important;
          box-shadow: 0 25px 50px rgba(236, 72, 153, 0.25), 0 0 40px rgba(236,72,153,0.12) !important;
        }
        .plan-select-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </div>
  );
}
