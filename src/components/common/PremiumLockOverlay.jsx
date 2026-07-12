import { Link } from 'react-router-dom';
import { LuLock, LuArrowRight, LuUser } from 'react-icons/lu';
import ElectricBorder from '../../content/Animations/ElectricBorder/ElectricBorder';

export default function PremiumLockOverlay({ isGuest = true }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(11, 15, 25, 0.7)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      borderRadius: '16px',
      zIndex: 10,
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        background: 'rgba(236, 72, 153, 0.1)',
        color: '#ec4899',
        padding: '16px',
        borderRadius: '50%',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
      }}>
        <LuLock size={28} />
      </div>

      <h3 style={{
        fontSize: '20px',
        fontWeight: 800,
        marginBottom: '8px',
        color: '#fff',
        textAlign: 'center'
      }}>
        {isGuest ? 'Unlock Premium Components' : 'Upgrade to Lifetime Access'}
      </h3>
      
      <p style={{
        color: '#94a3b8',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '340px',
        lineHeight: 1.5,
        marginBottom: '24px'
      }}>
        {isGuest 
          ? 'Sign in and get a lifetime license to copy code, download templates, and access all premium developer assets.'
          : 'Upgrade your account to Gold or Diamond membership to get unlimited access to this and hundreds of other premium elements.'
        }
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {isGuest ? (
          <>
            <Link to="/signin" className="ln-hero-btn ln-hero-btn-secondary" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '10px'
            }}>
              <LuUser size={14} /> Sign In
            </Link>
            <ElectricBorder color="#ec4899" speed={1.2} chaos={0.08} borderRadius={10}>
              <Link to="/pricing" style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Get Lifetime Access <LuArrowRight size={14} />
              </Link>
            </ElectricBorder>
          </>
        ) : (
          <ElectricBorder color="#ec4899" speed={1.2} chaos={0.08} borderRadius={10}>
            <Link to="/pricing" style={{
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Upgrade Now <LuArrowRight size={14} />
            </Link>
          </ElectricBorder>
        )}
      </div>
    </div>
  );
}
