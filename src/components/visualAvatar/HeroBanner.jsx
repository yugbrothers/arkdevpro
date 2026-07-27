import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Volume2, VolumeX, Sparkles, Star, Plus, Check } from 'lucide-react';

export default function HeroBanner({ avatar, onPlayClick, onMoreInfoClick, isSaved, onToggleSave }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '85vh',
        minHeight: '600px',
        maxHeight: '900px',
        overflow: 'hidden',
        background: '#0b0f19'
      }}
    >
      {/* Background Video / Image Backdrop */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <video
          ref={videoRef}
          src={avatar.videoUrl}
          autoPlay
          loop
          muted={muted}
          playsInline
          poster={avatar.backdrop}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7) contrast(1.1)'
          }}
        />
        {/* Vignette Gradients */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.4) 0%, rgba(11, 15, 25, 0) 30%, rgba(11, 15, 25, 0.8) 70%, #0b0f19 100%), linear-gradient(90deg, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.6) 40%, rgba(11, 15, 25, 0) 100%)'
          }}
        />
      </div>

      {/* Hero Content Overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 60px 100px 60px',
          maxWidth: '850px'
        }}
      >
        {/* Release Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#c084fc',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            width: 'fit-content'
          }}
        >
          <Sparkles size={14} color="#a855f7" />
          <span>FEATURED VISUAL AVATAR BLOCKBUSTER</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 950,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: '12px',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)'
          }}
        >
          {avatar.title}
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#c084fc',
            marginBottom: '16px',
            letterSpacing: '-0.2px'
          }}
        >
          {avatar.tagline}
        </p>

        {/* Metadata Specs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#cbd5e1',
            fontWeight: 600
          }}
        >
          <span style={{ color: '#22c55e', fontWeight: 800 }}>{avatar.matchScore}</span>
          <span style={{ border: '1px solid rgba(255, 255, 255, 0.3)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>
            {avatar.rating}
          </span>
          <span>{avatar.duration}</span>
          <span>{avatar.year}</span>
          <span style={{ color: '#94a3b8' }}>• {avatar.genre}</span>
        </div>

        {/* Synopsis */}
        <p
          style={{
            fontSize: '15px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '28px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {avatar.description}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => onPlayClick(avatar)}
            className="hero-play-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '14px',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '16px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 30px rgba(255, 255, 255, 0.3)'
            }}
          >
            <Play size={20} fill="#0f172a" color="#0f172a" />
            <span>Play Now</span>
          </button>

          <button
            onClick={() => onMoreInfoClick(avatar)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Info size={20} color="#fff" />
            <span>More Info</span>
          </button>

          <button
            onClick={() => onToggleSave(avatar.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: isSaved ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              border: isSaved ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isSaved ? 'Remove from My List' : 'Add to My List'}
          >
            {isSaved ? <Check size={20} color="#c084fc" /> : <Plus size={20} color="#fff" />}
          </button>
        </div>
      </div>

      {/* Mute Control Button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '100px',
          right: '60px',
          zIndex: 3,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Styles for hover animation */}
      <style>{`
        .hero-play-btn:hover {
          transform: scale(1.05);
          background: #e2e8f0 !important;
          boxShadow: 0 12px 40px rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
