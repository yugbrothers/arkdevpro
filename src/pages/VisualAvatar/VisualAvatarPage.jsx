import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarNavbar from '../../components/visualAvatar/AvatarNavbar';
import HeroBanner from '../../components/visualAvatar/HeroBanner';
import ContentRow from '../../components/visualAvatar/ContentRow';
import AvatarSearchOverlay from '../../components/visualAvatar/AvatarSearchOverlay';
import VideoPlayerModal from '../../components/visualAvatar/VideoPlayerModal';
import { FEATURED_HERO_AVATAR, VISUAL_AVATARS_CATALOG, CATEGORIES_CONFIG } from '../../data/visualAvatarData';
import Footer from '../../components/landingnew/Footer/Footer';

export default function VisualAvatarPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePlayerAvatar, setActivePlayerAvatar] = useState(null);
  const [myList, setMyList] = useState(() => {
    try {
      const saved = localStorage.getItem('visualAvatar_myList');
      return saved ? JSON.parse(saved) : ['antigravity-nexus', 'cyber-pulse-rebellion'];
    } catch {
      return ['antigravity-nexus', 'cyber-pulse-rebellion'];
    }
  });

  const [continueWatching, setContinueWatching] = useState(() => {
    try {
      const saved = localStorage.getItem('visualAvatar_continueWatching');
      return saved ? JSON.parse(saved) : [VISUAL_AVATARS_CATALOG[1], VISUAL_AVATARS_CATALOG[2]];
    } catch {
      return [VISUAL_AVATARS_CATALOG[1], VISUAL_AVATARS_CATALOG[2]];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ArkDev - Visual Avatar Streaming Platform';
  }, []);

  const handleToggleSave = (avatarId) => {
    const updated = myList.includes(avatarId)
      ? myList.filter(id => id !== avatarId)
      : [...myList, avatarId];
    setMyList(updated);
    try {
      localStorage.setItem('visualAvatar_myList', JSON.stringify(updated));
    } catch (e) {}
  };

  const handlePlayAvatar = (avatar) => {
    setActivePlayerAvatar(avatar);
    // Add to continue watching if not present
    if (!continueWatching.some(i => i.id === avatar.id)) {
      const updated = [avatar, ...continueWatching].slice(0, 8);
      setContinueWatching(updated);
      try {
        localStorage.setItem('visualAvatar_continueWatching', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleNextAvatar = () => {
    if (!activePlayerAvatar) return;
    const currentIndex = VISUAL_AVATARS_CATALOG.findIndex(i => i.id === activePlayerAvatar.id);
    const nextIndex = (currentIndex + 1) % VISUAL_AVATARS_CATALOG.length;
    handlePlayAvatar(VISUAL_AVATARS_CATALOG[nextIndex]);
  };

  const handleSelectAvatarDetails = (avatar) => {
    navigate(`/visual-avatar/view/${avatar.id}`);
  };

  // Filter Catalog by selected Navbar Tab
  const getFilteredCatalog = () => {
    if (activeTab === 'movies') return VISUAL_AVATARS_CATALOG.filter(i => !i.isSeries);
    if (activeTab === 'series') return VISUAL_AVATARS_CATALOG.filter(i => i.isSeries);
    if (activeTab === 'new') return VISUAL_AVATARS_CATALOG.filter(i => i.year === '2026');
    if (activeTab === 'mylist') return VISUAL_AVATARS_CATALOG.filter(i => myList.includes(i.id));
    return VISUAL_AVATARS_CATALOG;
  };

  const currentCatalog = getFilteredCatalog();

  return (
    <div style={{ background: '#0b0f19', color: '#ffffff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <AvatarNavbar
        onSearchClick={() => setSearchOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myListCount={myList.length}
      />

      {/* Hero Banner Section */}
      <HeroBanner
        avatar={FEATURED_HERO_AVATAR}
        onPlayClick={handlePlayAvatar}
        onMoreInfoClick={handleSelectAvatarDetails}
        isSaved={myList.includes(FEATURED_HERO_AVATAR.id)}
        onToggleSave={handleToggleSave}
      />

      {/* Main Content Rows Section */}
      <div style={{ marginTop: '-40px', position: 'relative', zIndex: 10, pb: '80px' }}>
        {/* Continue Watching Row if available */}
        {continueWatching.length > 0 && activeTab === 'all' && (
          <ContentRow
            title="▶ Continue Watching"
            items={continueWatching}
            onPlay={handlePlayAvatar}
            onSelect={handleSelectAvatarDetails}
            myList={myList}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* My List Row */}
        {myList.length > 0 && (activeTab === 'all' || activeTab === 'mylist') && (
          <ContentRow
            title="🔖 My Bookmarked Avatars"
            items={VISUAL_AVATARS_CATALOG.filter(i => myList.includes(i.id))}
            onPlay={handlePlayAvatar}
            onSelect={handleSelectAvatarDetails}
            myList={myList}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* Dynamically configured categories */}
        {CATEGORIES_CONFIG.map(cat => {
          const rowItems = cat.filter(currentCatalog);
          if (rowItems.length === 0) return null;
          return (
            <ContentRow
              key={cat.id}
              title={cat.title}
              items={rowItems}
              onPlay={handlePlayAvatar}
              onSelect={handleSelectAvatarDetails}
              myList={myList}
              onToggleSave={handleToggleSave}
            />
          );
        })}
      </div>

      {/* Search Overlay */}
      <AvatarSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAvatar={handleSelectAvatarDetails}
        onPlayAvatar={handlePlayAvatar}
      />

      {/* Video Player Modal */}
      {activePlayerAvatar && (
        <VideoPlayerModal
          avatar={activePlayerAvatar}
          onClose={() => setActivePlayerAvatar(null)}
          onNext={handleNextAvatar}
        />
      )}

      {/* Cinematic Footer */}
      <Footer />
    </div>
  );
}
