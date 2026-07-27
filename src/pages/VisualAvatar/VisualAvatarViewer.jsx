import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, ArrowLeft, Plus, Check, Star, Film, Sparkles, Share2, Volume2, ThumbsUp } from 'lucide-react';
import AvatarNavbar from '../../components/visualAvatar/AvatarNavbar';
import ContentRow from '../../components/visualAvatar/ContentRow';
import VideoPlayerModal from '../../components/visualAvatar/VideoPlayerModal';
import { VISUAL_AVATARS_CATALOG } from '../../data/visualAvatarData';
import Footer from '../../components/landingnew/Footer/Footer';
import { toast } from 'sonner';

export default function VisualAvatarViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [isPlayingModal, setIsPlayingModal] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const found = VISUAL_AVATARS_CATALOG.find(i => i.id === id) || VISUAL_AVATARS_CATALOG[0];
    setAvatar(found);
    if (found.isSeries && found.episodes?.length > 0) {
      setSelectedEpisode(found.episodes[0]);
    }
    document.title = `Watch ${found.title} - Visual Avatar Streaming`;

    try {
      const saved = JSON.parse(localStorage.getItem('visualAvatar_myList') || '[]');
      setIsSaved(saved.includes(found.id));
    } catch (e) {}
  }, [id]);

  const handleToggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('visualAvatar_myList') || '[]');
      const updated = isSaved ? saved.filter(i => i !== avatar.id) : [...saved, avatar.id];
      localStorage.setItem('visualAvatar_myList', JSON.stringify(updated));
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from My List' : 'Added to My List!');
    } catch (e) {}
  };

  if (!avatar) return null;

  const relatedContent = VISUAL_AVATARS_CATALOG.filter(i => i.id !== avatar.id);

  return (
    <div style={{ background: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <AvatarNavbar activeTab="all" setActiveTab={() => navigate('/visual-avatar')} />

      {/* Hero Viewer Showcase Header */}
      <div style={{ position: 'relative', width: '100%', pt: '100px', pb: '60px', paddingLeft: '60px', paddingRight: '60px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/visual-avatar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '30px',
            marginTop: '20px'
          }}
        >
          <ArrowLeft size={16} /> Back to Streaming
        </button>

        {/* Video Player Display Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '65vh',
            minHeight: '450px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(168, 85, 247, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <video
            src={selectedEpisode ? avatar.videoUrl : avatar.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={avatar.backdrop}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(11,15,25,0.2) 0%, rgba(11,15,25,0.85) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              onClick={() => setIsPlayingModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 40px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(168, 85, 247, 0.7)',
                transition: 'transform 0.2s'
              }}
            >
              <Play size={24} fill="#fff" />
              <span>START WATCHING NOW</span>
            </button>
          </div>
        </div>

        {/* Video Specs Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', marginTop: '40px' }}>
          {/* Main Specs Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '15px' }}>{avatar.matchScore}</span>
              <span style={{ border: '1px solid rgba(255, 255, 255, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                {avatar.rating}
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{avatar.duration}</span>
              <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{avatar.year}</span>
            </div>

            <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
              {avatar.title}
            </h1>

            <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              {avatar.description}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleToggleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: isSaved ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: isSaved ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSaved ? <Check size={18} color="#c084fc" /> : <Plus size={18} />}
                <span>{isSaved ? 'In My List' : 'Add to My List'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>

            {/* Episodes list if series */}
            {avatar.isSeries && avatar.episodes?.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Episodes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {avatar.episodes.map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => setSelectedEpisode(ep)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderRadius: '14px',
                        background: selectedEpisode?.id === ep.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                        border: selectedEpisode?.id === ep.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Play size={16} fill="#c084fc" color="#c084fc" />
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>{ep.title}</span>
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{ep.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Right Panel */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', height: 'fit-content' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Cast</div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
                {avatar.cast?.join(', ') || 'N/A'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Director</div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
                {avatar.director || 'Visual Studio AI'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Genres</div>
              <div style={{ color: '#c084fc', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
                {avatar.genre}
              </div>
            </div>
          </div>
        </div>

        {/* Related Content Row */}
        <div style={{ marginTop: '60px' }}>
          <ContentRow
            title="✨ Related Visual Avatars You May Like"
            items={relatedContent}
            onPlay={(av) => {
              setAvatar(av);
              setIsPlayingModal(true);
            }}
            onSelect={(av) => navigate(`/visual-avatar/view/${av.id}`)}
            myList={[]}
            onToggleSave={() => {}}
          />
        </div>
      </div>

      {/* Fullscreen Video Player */}
      {isPlayingModal && (
        <VideoPlayerModal
          avatar={avatar}
          onClose={() => setIsPlayingModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}
