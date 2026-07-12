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
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '120px 24px 80px', position: 'relative' }}>
        
        {/* Background ambient lighting */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 70%)',
          top: '30%',
          right: '-10%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '60px', zIndex: 1, position: 'relative' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '15px',
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Lifetime Pricing Plans
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
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
                background: 'rgba(17, 24, 39, 0.45)',
                backdropFilter: 'blur(24px) saturate(1.2)',
                border: plan.popular ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '40px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: plan.popular 
                  ? '0 25px 60px -10px rgba(236, 72, 153, 0.25), 0 0 40px rgba(236,72,153,0.1)' 
                  : '0 20px 40px rgba(0,0,0,0.4)',
                transform: plan.popular ? 'scale(1.03)' : 'none',
                transition: 'all 0.3s ease'
              }}
              className={`pricing-card ${plan.popular ? 'popular-glow-card' : ''}`}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(to right, #ec4899, #a855f7)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 15px rgba(236,72,153,0.4)'
                }}>
                  Most Popular Plan
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{plan.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', margin: '20px 0' }}>
                  <span style={{ fontSize: '22px', fontWeight: 600, color: '#94a3b8', marginRight: '4px' }}>₹</span>
                  <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px', fontWeight: 500 }}>One-time pay</span>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e2e8f0' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: plan.popular ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.03)',
                        color: plan.popular ? '#ec4899' : '#94a3b8',
                        border: plan.popular ? '1px solid rgba(236,72,153,0.2)' : '1px solid rgba(255,255,255,0.08)'
                      }}>
                        <LuCheck size={12} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.popular ? (
                <ElectricBorder color="#ec4899" speed={1.2} chaos={0.08} borderRadius={12} style={{ marginTop: '35px', width: '100%' }}>
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      border: 'none',
                      padding: '14px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Choose {plan.name} <LuArrowRight size={15} />
                  </button>
                </ElectricBorder>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '14px',
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  className="plan-select-btn"
                >
                  Choose {plan.name} <LuArrowRight size={15} />
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
          transform: translateY(-4px) !important;
        }
        .popular-glow-card:hover {
          border-color: #ec4899 !important;
          box-shadow: 0 30px 70px -10px rgba(236, 72, 153, 0.35), 0 0 50px rgba(236,72,153,0.15) !important;
        }
        .plan-select-btn:hover {
          background: ${plans[2].color};
          border-color: transparent !important;
          box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3);
        }
      `}</style>
    </div>
  );
}
