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
  const [detectionActive, setDetectionActive] = useState(false);
  const [player1Color, setPlayer1Color] = useState('#FF006E');
  const [player2Color, setPlayer2Color] = useState('#00D9FF');
  const [trailLength, setTrailLength] = useState(30);
  const [manualMode, setManualMode] = useState(false);
  const [player1Pos, setPlayer1Pos] = useState(null);
  const [player2Pos, setPlayer2Pos] = useState(null);
  const [calibrationMode, setCalibrationMode] = useState(false);

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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let detections;

        if (manualMode && player1Pos && player2Pos) {
          // Use manual positions
          detections = {
            player1: { x: player1Pos.x, y: player1Pos.y, score: 1.0 },
            player2: { x: player2Pos.x, y: player2Pos.y, score: 1.0 }
          };
        } else {
          // Use AI detection
          detections = await swordDetectorRef.current.detect(video);
        }

        trailRendererRef.current.addFrame(detections, {
          player1Color,
          player2Color,
          trailLength
        });

        trailRendererRef.current.render(ctx, canvas.width, canvas.height);

        // Draw calibration points if in manual mode
        if (manualMode) {
          drawCalibrationPoints(ctx);
        }
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
  }, [detectionActive, isPlaying, player1Color, player2Color, trailLength, manualMode, player1Pos, player2Pos]);

  const drawCalibrationPoints = (ctx) => {
    if (player1Pos) {
      ctx.save();
      ctx.fillStyle = player1Color;
      ctx.beginPath();
      ctx.arc(player1Pos.x, player1Pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('P1', player1Pos.x, player1Pos.y + 25);
      ctx.restore();
    }

    if (player2Pos) {
      ctx.save();
      ctx.fillStyle = player2Color;
      ctx.beginPath();
      ctx.arc(player2Pos.x, player2Pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('P2', player2Pos.x, player2Pos.y + 25);
      ctx.restore();
    }
  };

  const handleCanvasClick = (e) => {
    if (!calibrationMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (!player1Pos) {
      setPlayer1Pos({ x, y });
      alert('✅ Zawodnik 1 (LEWY) zaznaczony! Teraz kliknij na pozycję zawodnika 2 (PRAWY)');
    } else if (!player2Pos) {
      setPlayer2Pos({ x, y });
      setCalibrationMode(false);
      setManualMode(true);
      alert('✅ Zawodnik 2 (PRAWY) zaznaczony! Kalibracja gotowa!');
    }
  };

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

  const startCalibration = () => {
    if (isPlaying) {
      videoRef.current.pause();
    }
    setCalibrationMode(true);
    setPlayer1Pos(null);
    setPlayer2Pos(null);
    alert('🎯 KALIBRACJA:\n1. Kliknij na LEWEGO zawodnika\n2. Kliknij na PRAWEGO zawodnika\n\nKliknij na video aby zaznaczył zawodników!');
  };

  const resetCalibration = () => {
    setPlayer1Pos(null);
    setPlayer2Pos(null);
    setCalibrationMode(false);
    setManualMode(false);
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
        ← Powrót
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
            className={`detection-canvas ${calibrationMode ? 'calibration-mode' : ''}`}
            onClick={handleCanvasClick}
            width={1280}
            height={720}
          />
          {calibrationMode && (
            <div className="calibration-overlay">
              🎯 Kliknij na zawodnika {player1Pos ? '2 (PRAWY)' : '1 (LEWY)'}
            </div>
          )}
        </div>

        <div className="controls-panel">
          <div className="playback-controls">
            <button 
              className="btn-control play-btn"
              onClick={togglePlayPause}
            >
              {isPlaying ? '⏸ Pauza' : '▶ Odtwarzaj'}
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
              <label>Prędkość: {playbackSpeed.toFixed(1)}x</label>
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
            <h3>⚙️ Ustawienia</h3>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={detectionActive}
                  onChange={(e) => setDetectionActive(e.target.checked)}
                />
                <span>Włącz Detektowanie Szpady</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                  disabled={!player1Pos || !player2Pos}
                />
                <span>Tryb Manual {player1Pos && player2Pos ? '✅' : '(kalibruj pierwszy)'}</span>
              </label>
            </div>

            <div className="calibration-buttons">
              <button 
                className="btn-calibrate"
                onClick={startCalibration}
              >
                🎯 Kalibruj Zawodników
              </button>
              {player1Pos && player2Pos && (
                <button 
                  className="btn-reset"
                  onClick={resetCalibration}
                >
                  ↺ Reset Kalibracji
                </button>
              )}
            </div>

            {player1Pos && player2Pos && (
              <div className="calibration-status">
                ✅ P1: ({player1Pos.x.toFixed(0)}, {player1Pos.y.toFixed(0)})<br/>
                ✅ P2: ({player2Pos.x.toFixed(0)}, {player2Pos.y.toFixed(0)})
              </div>
            )}

            <hr />

            <div className="setting-group">
              <label>Kolor Zawodnika 1 (LEWY)</label>
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
              <label>Kolor Zawodnika 2 (PRAWY)</label>
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
              <label>Długość Wstążki: {trailLength} klatek</label>
              <input
                type="range"
                min="5"
                max="100"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                className="slider"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <p>💡 Jeśli detekcja nie działa dobrze, użyj "Kalibruj Zawodników" aby ręcznie wskazać pozycje!</p>
      </div>
    </div>
  );
}

export default VideoPlayer;
