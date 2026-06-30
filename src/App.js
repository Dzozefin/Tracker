import React, { useState } from 'react';
import './App.css';
import VideoUploader from './components/VideoUploader';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const [videoSource, setVideoSource] = useState(null);
  const [videoType, setVideoType] = useState(null); // 'file' or 'camera'

  return (
    <div className="app">
      <header className="header">
        <h1>⚔️ Tracker - Szermierka Analysis</h1>
        <p>Real-time sword movement tracking</p>
      </header>

      <main className="container">
        {!videoSource ? (
          <VideoUploader 
            onVideoSelect={setVideoSource}
            onVideoTypeSet={setVideoType}
          />
        ) : (
          <VideoPlayer 
            videoSource={videoSource}
            videoType={videoType}
            onBack={() => {
              setVideoSource(null);
              setVideoType(null);
            }}
          />
        )}
      </main>

      <footer className="footer">
        <p>© 2024 Tracker - Fencing Analysis Tool</p>
      </footer>
    </div>
  );
}

export default App;
