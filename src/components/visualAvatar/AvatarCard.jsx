import { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, Share2, Info, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AvatarCard({ avatar, onPlay, onSelect, isSaved, onToggleSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(window.location.origin + `/visual-avatar/view/${avatar.id}`);
    toast.success(`Share link for "${avatar.title}" copied to clipboard!`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    toast.success(liked ? 'Removed from Liked' : `Liked "${avatar.title}"!`);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(avatar)}
      style={{
        position: 'relative',
        width: '240px',
        flexShrink: 0,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.08) translateY(-8px)' : 'scale(1)',
        zIndex: isHovered ? 100 : 1,
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(168, 85, 247, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Poster Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#1e293b'
        }}
      >
        <video
          src={avatar.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          poster={avatar.poster}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            filter: isHovered ? 'brightness(0.95) contrast(1.05)' : 'brightness(0.85)'
          }}
        />

        {/* Quality Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 800,
            color: '#c084fc'
          }}
        >
          {avatar.rating}
        </div>

        {avatar.isSeries && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#fff'
            }}
          >
            SERIES
          </div>
        )}

        {/* Center Play Overlay Icon on Hover */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(11, 15, 25, 0.3)'
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onPlay(avatar);
              }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)',
                transition: 'transform 0.2s',
                transform: 'scale(1)'
              }}
            >
              <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: '4px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div
        style={{
          padding: '12px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '-4px'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {avatar.title}
        </div>

        {/* Specs Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span style={{ color: '#22c55e', fontWeight: 800 }}>{avatar.matchScore}</span>
          <span>{avatar.duration}</span>
          <span>{avatar.year}</span>
        </div>

        {/* Expanded Hover Action Panel */}
        {isHovered && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(avatar);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Play"
                >
                  <Play size={14} fill="#0f172a" color="#0f172a" style={{ marginLeft: '2px' }} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(avatar.id);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isSaved ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    border: isSaved ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title={isSaved ? 'Remove from My List' : 'Add to My List'}
                >
                  {isSaved ? <Check size={14} color="#c084fc" /> : <Plus size={14} color="#fff" />}
                </button>

                <button
                  onClick={handleLike}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: liked ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    border: liked ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Like"
                >
                  <ThumbsUp size={13} color={liked ? '#60a5fa' : '#fff'} />
                </button>
              </div>

              <button
                onClick={handleShare}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Share"
              >
                <Share2 size={13} color="#fff" />
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {avatar.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
