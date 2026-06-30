import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class SwordDetector {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.detectionCache = [];
  }

  async loadModel() {
    if (this.model) return;
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      this.model = await cocoSsd.load();
      console.log('COCO-SSD model loaded');
    } catch (err) {
      console.error('Failed to load detection model:', err);
      this.isLoading = false;
    }
    this.isLoading = false;
  }

  async detect(videoElement) {
    await this.loadModel();

    if (!this.model || !videoElement) {
      return { player1: null, player2: null };
    }

    try {
      // Run detection
      const predictions = await this.model.estimateObjects(videoElement, 1);

      // Filter for sword-like detections (we'll look for long thin objects)
      const swordDetections = predictions.filter(pred => {
        // Look for classes that might be relevant
        // COCO-SSD includes sports equipment
        const relevantClasses = ['sports ball', 'frisbee', 'skis', 'snowboard'];
        
        // Also accept high confidence detections of small objects
        return pred.score > 0.5 && (
          relevantClasses.includes(pred.class) ||
          (pred.bbox[2] < 100 && pred.bbox[3] > 50) // long thin shape
        );
      });

      // Split detections into two players (left and right)
      const centerX = videoElement.videoWidth / 2;
      const player1Detections = swordDetections.filter(d => d.bbox[0] + d.bbox[2]/2 < centerX);
      const player2Detections = swordDetections.filter(d => d.bbox[0] + d.bbox[2]/2 >= centerX);

      // Get the topmost point (sword tip)
      const getTipPoint = (detections) => {
        if (detections.length === 0) return null;
        
        // Find topmost detection
        const topmost = detections.reduce((min, d) => 
          d.bbox[1] < min.bbox[1] ? d : min
        );

        // Calculate center point of bounding box
        return {
          x: topmost.bbox[0] + topmost.bbox[2] / 2,
          y: topmost.bbox[1],
          score: topmost.score
        };
      };

      return {
        player1: getTipPoint(player1Detections),
        player2: getTipPoint(player2Detections)
      };
    } catch (err) {
      console.error('Detection error:', err);
      return { player1: null, player2: null };
    }
  }

  // Simple motion detection fallback
  async detectMotionPoints(videoElement) {
    // This is a fallback method using frame differencing
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Find high-motion areas (simplified)
    let maxMotion = { x: 0, y: 0, val: 0 };
    
    // This is a placeholder - in production you'd use optical flow
    // For now, return null to use the main detection
    return { player1: null, player2: null };
  }
}

export default SwordDetector;
