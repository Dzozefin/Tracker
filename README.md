⚔️ # Tracker - Szermierka Analysis Tool

Real-time sword movement tracking and analysis for fencing matches.

## Features

- 📹 **Video Upload & Live Camera** - Analyze recorded matches or real-time practice sessions
- 🤖 **Automatic Sword Detection** - AI-powered detection of sword tips using TensorFlow.js
- ✨ **Animated Trails** - Visualize sword movement with customizable colored trails
- ⚡ **Speed Control** - Slow down video playback with customizable playback speeds
- 🎨 **Customization** - Adjust colors, trail length, and other visual parameters
- 💾 **Export** - Save analyzed video with overlaid trails

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Dzozefin/Tracker.git
cd Tracker

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## How to Use

### 1. Upload a Video
- Click "Upload Video" to select a recorded fencing match
- Or click "Live Camera" for real-time analysis

### 2. Enable Detection
- Check "Enable Sword Detection" to start tracking
- The system will automatically detect sword tips

### 3. Customize Visualization
- Choose colors for each player (Player 1 & 2)
- Adjust trail length to show movement duration
- Control playback speed

### 4. Analyze
- Click on the video to rewind 10 seconds and slow down playback
- Use playback controls to examine specific moments
- Export with trails when ready

## Technology Stack

- **React** - UI framework
- **TensorFlow.js** - AI-powered object detection
- **Canvas API** - Real-time visualization
- **COCO-SSD** - Pre-trained object detection model

## Project Structure

```
Tracker/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── VideoUploader.js
│   │   ├── VideoUploader.css
│   │   ├── VideoPlayer.js
│   │   └── VideoPlayer.css
│   ├── services/
│   │   ├── SwordDetector.js      # TensorFlow detection logic
│   │   └── TrailRenderer.js      # Trail visualization
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## API & Services

### SwordDetector
Handles automatic detection of sword tips using TensorFlow.js COCO-SSD model.

```javascript
const detector = new SwordDetector();
const points = await detector.detect(videoElement);
// Returns: { player1: {x, y, score}, player2: {x, y, score} }
```

### TrailRenderer
Manages trail visualization and animation with fade-out effects.

```javascript
const renderer = new TrailRenderer();
renderer.addFrame(detections, { player1Color, player2Color, trailLength });
renderer.render(ctx, canvasWidth, canvasHeight);
```

## Deployment

### On Your Server

1. Build the project:
```bash
npm run build
```

2. Serve the `build/` folder with your web server (Nginx, Apache, Node.js, etc.)

3. Point your domain to the server

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/tracker/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

## Performance Tips

- Use high-quality video (720p or higher)
- Ensure good lighting for better detection
- Film from the side to capture sword movement clearly
- Larger trail lengths may impact performance on older devices

## Future Enhancements

- [ ] 3D trajectory analysis
- [ ] Speed/velocity measurements
- [ ] Hit point detection
- [ ] Multi-angle support
- [ ] Machine learning model optimization
- [ ] Advanced statistics and analytics
- [ ] Video export with multiple quality options
- [ ] Cloud storage integration

## Troubleshooting

### Detection not working
- Check browser console for errors (F12)
- Ensure good lighting in the video
- Try a different video format
- Verify TensorFlow.js loaded successfully

### Performance issues
- Reduce video resolution
- Decrease trail length
- Lower playback speed
- Close other browser tabs

### Video won't load
- Check file format (MP4, WebM, Ogg)
- Verify CORS settings if hosting on different domain
- Try a different video file

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Support

For issues and questions, please create a GitHub issue or contact support.

---

**Made with ❤️ for fencing enthusiasts**
