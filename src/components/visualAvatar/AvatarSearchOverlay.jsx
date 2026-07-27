import { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Sparkles, Filter, Play } from 'lucide-react';
import { VISUAL_AVATARS_CATALOG } from '../../data/visualAvatarData';

export default function AvatarSearchOverlay({ isOpen, onClose, onSelectAvatar, onPlayAvatar }) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSelectedGenre('All');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const genres = ['All', 'Sci-Fi', 'Action', 'Fantasy', 'Cyberpunk', 'Animation', 'Horror', 'Mystery', 'Anime', 'Documentary'];

  const filtered = VISUAL_AVATARS_CATALOG.filter(item => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.genre.toLowerCase().includes(query.toLowerCase()) ||
      item.cast.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
      item.year.includes(query);

    const matchesGenre = selectedGenre === 'All' || item.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesQuery && matchesGenre;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3000,
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        paddingBottom: '40px',
        overflowY: 'auto'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '24px',
          right: '40px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={20} />
      </button>

      {/* Main Search Input Box */}
      <div style={{ width: '100%', maxW: '800px', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '2px solid rgba(168, 85, 247, 0.5)',
            borderRadius: '20px',
            padding: '16px 24px',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
          }}
        >
          <Search size={24} color="#a855f7" style={{ marginRight: '16px' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Visual Avatar title, genre, year, actor..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 600
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Genre Pill Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              style={{
                padding: '6px 16px',
                borderRadius: '16px',
                background: selectedGenre === g ? '#a855f7' : 'rgba(255, 255, 255, 0.08)',
                border: selectedGenre === g ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Results Metadata Bar */}
        <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
          <span>Found {filtered.length} Visual Avatars</span>
          <span>Press ESC to exit</span>
        </div>

        {/* Results Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px',
            marginTop: '10px'
          }}
        >
          {filtered.map(avatar => (
            <div
              key={avatar.id}
              onClick={() => {
                onSelectAvatar(avatar);
                onClose();
              }}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            >
              <img src={avatar.poster} alt={avatar.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{avatar.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#22c55e' }}>{avatar.matchScore}</span>
                  <span>{avatar.year}</span>
                  <span>{avatar.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
