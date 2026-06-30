import React, { useRef } from 'react';
import './VideoUploader.css';

function VideoUploader({ onVideoSelect, onVideoTypeSet }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      onVideoSelect(url);
      onVideoTypeSet('file');
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        onVideoSelect(stream);
        onVideoTypeSet('camera');
      }
    } catch (err) {
      alert('Error accessing camera: ' + err.message);
    }
  };

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <h2>Choose Video Source</h2>
        <p className="subtitle">Select how you want to analyze the sword movement</p>

        <div className="options-grid">
          {/* Upload Video */}
          <div className="option-card upload-card">
            <div className="icon">📹</div>
            <h3>Upload Video</h3>
            <p>Analyze a recorded fencing match</p>
            <button 
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Live Camera */}
          <div className="option-card camera-card">
            <div className="icon">📷</div>
            <h3>Live Camera</h3>
            <p>Real-time sword tracking during practice</p>
            <button 
              className="btn btn-secondary"
              onClick={handleLiveCamera}
            >
              Start Live
            </button>
          </div>
        </div>

        <div className="info-box">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Use high-quality video for better tracking</li>
            <li>Ensure good lighting for optimal detection</li>
            <li>Film from the side to capture sword movement clearly</li>
            <li>Recommended resolution: 720p or higher</li>
          </ul>
        </div>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
    </div>
  );
}

export default VideoUploader;
