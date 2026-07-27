import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AvatarCard from './AvatarCard';

export default function ContentRow({ title, items = [], onPlay, onSelect, myList = [], onToggleSave }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px', padding: '0 40px', position: 'relative' }}>
      {/* Category Section Header */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.3px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {title}
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
          {items.length} Videos
        </span>
      </h2>

      {/* Row Container Wrapper with Arrows */}
      <div style={{ position: 'relative' }}>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            top: '50%',
            left: '-20px',
            transform: 'translateY(-50%)',
            zIndex: 200,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ChevronLeft size={22} color="#fff" />
        </button>

        {/* Scrollable Items Container */}
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '12px 0 24px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {items.map(avatar => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              onPlay={onPlay}
              onSelect={onSelect}
              isSaved={myList.includes(avatar.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-20px',
            transform: 'translateY(-50%)',
            zIndex: 200,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ChevronRight size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}
