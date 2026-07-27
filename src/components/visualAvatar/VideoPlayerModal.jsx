import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, SkipForward, Music, Radio, Disc3, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoPlayerModal({ avatar, onClose, onNext }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState('English');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (avatar) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [avatar]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current?.play().catch(() => {});
      audioRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    if (videoRef.current) videoRef.current.muted = nextMuted;
    if (audioRef.current) audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
    } else if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleVideoEnded = () => {
    toast.info('Autoplaying next SYG_Anime video with Pixabay music track...');
    if (onNext) {
      onNext();
    }
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    const targetTime = (newProgress / 100) * (duration || 1);
    if (audioRef.current) audioRef.current.currentTime = targetTime;
    if (videoRef.current) videoRef.current.currentTime = targetTime % (videoRef.current.duration || 1);
    setProgress(newProgress);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!avatar) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Video Stream - Loops continuously to match music duration */}
      <video
        ref={videoRef}
        src={avatar.videoUrl}
        autoPlay
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Synchronized Pixabay Music Audio Track - Advances on Completion */}
      {avatar.musicUrl && (
        <audio
          ref={audioRef}
          src={avatar.musicUrl}
          autoPlay
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      )}

      {/* Music Track Badge Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          zIndex: 5100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 20px',
          borderRadius: '20px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
        }}
      >
        <Disc3 size={20} color="#a855f7" className="spinning-disc" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🎵 Synced Pixabay Music Track
          </span>
          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>
            {avatar.musicTitle || 'Pixabay Cinematic Music'}
          </span>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '30px',
          right: '40px',
          zIndex: 5100,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={24} />
      </button>

      {/* Skip to Next Video Button */}
      <button
        onClick={handleVideoEnded}
        style={{
          position: 'absolute',
          bottom: '110px',
          right: '40px',
          zIndex: 5100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <SkipForward size={16} color="#a855f7" />
        <span>Next Video & Music</span>
      </button>

      {/* Bottom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 5100,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 100%)',
          padding: '24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} fill="#fff" />}
            </button>
            <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginLeft: '12px' }}>
              {avatar.title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                setPlaybackSpeed(nextSpeed);
                toast.info(`Playback Speed: ${nextSpeed}x`);
              }}
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              {playbackSpeed}x Speed
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning-disc {
          animation: spin 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
