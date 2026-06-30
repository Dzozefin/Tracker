import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import SwordDetector from '../services/SwordDetector';
import TrailRenderer from '../services/TrailRenderer';

function VideoPlayer({ videoSource, videoType, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [player1Color, setPlayer1Color] = useState('#FF006E');
  const [player2Color, setPlayer2Color] = useState('#00D9FF');
  const [trailLength, setTrailLength] = useState(30);

  const swordDetectorRef = useRef(new SwordDetector());
  const trailRendererRef = useRef(new TrailRenderer());
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (videoType === 'file') {
      video.src = videoSource;
    } else if (videoType === 'camera') {
      video.srcObject = videoSource;
      video.play();
      setIsPlaying(true);
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoSource, videoType]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (!detectionActive || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const detectFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      try {
        // Draw video frame
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detect sword tips
        const detections = await swordDetectorRef.current.detect(video);

        // Render trails
        trailRendererRef.current.addFrame(detections, {
          player1Color,
          player2Color,
          trailLength
        });

        trailRendererRef.current.render(ctx, canvas.width, canvas.height);
      } catch (err) {
        console.error('Detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    animationFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [detectionActive, isPlaying, player1Color, player2Color, trailLength]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleCanvasClick = () => {
    const video = videoRef.current;
    if (video) {
      // Slow down 10 seconds before this point
      const newTime = Math.max(0, video.currentTime - 10);
      video.currentTime = newTime;
      setPlaybackSpeed(0.5);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="video-player-container">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="player-main">
        <div className="canvas-wrapper">
          <video
            ref={videoRef}
            style={{ display: 'none' }}
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className="detection-canvas"
            onClick={handleCanvasClick}
            width={1280}
            height={720}
          />
        </div>

        <div className="controls-panel">
          <div className="playback-controls">
            <button 
              className="btn-control play-btn"
              onClick={togglePlayPause}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <div className="progress-bar">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const video = videoRef.current;
                  if (video) {
                    video.currentTime = e.target.value;
                  }
                }}
                className="timeline"
              />
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="speed-control">
              <label>Speed: {playbackSpeed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          <div className="settings-panel">
            <h3>Trail Settings</h3>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={detectionActive}
                  onChange={(e) => setDetectionActive(e.target.checked)}
                />
                <span>Enable Sword Detection</span>
              </label>
            </div>

            <div className="setting-group">
              <label>Player 1 Color (Left)</label>
              <div className="color-picker-group">
                <input
                  type="color"
                  value={player1Color}
                  onChange={(e) => setPlayer1Color(e.target.value)}
                  className="color-picker"
                />
                <span className="color-code">{player1Color}</span>
              </div>
            </div>

            <div className="setting-group">
              <label>Player 2 Color (Right)</label>
              <div className="color-picker-group">
                <input
                  type="color"
                  value={player2Color}
                  onChange={(e) => setPlayer2Color(e.target.value)}
                  className="color-picker"
                />
                <span className="color-code">{player2Color}</span>
              </div>
            </div>

            <div className="setting-group">
              <label>Trail Length: {trailLength} frames</label>
              <input
                type="range"
                min="5"
                max="100"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                className="slider"
              />
            </div>

            <button className="btn-export">
              💾 Export Video with Trails
            </button>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <p>💡 Click on canvas to slow down video 10 seconds before that moment</p>
      </div>
    </div>
  );
}

export default VideoPlayer;
