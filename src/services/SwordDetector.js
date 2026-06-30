import * as cocoSsd from '@tensorflow-models/coco-ssd';

class SwordDetector {
  constructor() {
    this.model = null;
    this.isLoading = false;
  }

  async loadModel() {
    if (this.model) return;
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    try {
      console.log('Loading COCO-SSD model...');
      this.model = await cocoSsd.load();
      console.log('✅ COCO-SSD model loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load detection model:', err);
      this.isLoading = false;
      throw err;
    }
    this.isLoading = false;
  }

  async detect(videoElement) {
    try {
      await this.loadModel();

      if (!this.model || !videoElement) {
        return { player1: null, player2: null };
      }

      const predictions = await this.model.estimateObjects(videoElement, 1);

      if (!predictions || predictions.length === 0) {
        return { player1: null, player2: null };
      }

      const videoWidth = videoElement.videoWidth || 1280;
      const videoHeight = videoElement.videoHeight || 720;

      const detections = predictions.filter(pred => {
        if (!pred.bbox) return false;
        
        const width = pred.bbox[2];
        const height = pred.bbox[3];
        
        const isThinElongated = (width < 150 && height > 50) || (height < 150 && width > 50);
        return pred.score > 0.4 && isThinElongated;
      });

      const centerX = videoWidth / 2;
      const leftDetections = detections.filter(d => d.bbox[0] + d.bbox[2]/2 < centerX);
      const rightDetections = detections.filter(d => d.bbox[0] + d.bbox[2]/2 >= centerX);

      const getTipPoint = (dets) => {
        if (dets.length === 0) return null;
        
        const topmost = dets.reduce((min, d) => 
          d.bbox[1] < min.bbox[1] ? d : min
        );

        return {
          x: topmost.bbox[0] + topmost.bbox[2] / 2,
          y: topmost.bbox[1],
          score: topmost.score
        };
      };

      return {
        player1: getTipPoint(leftDetections),
        player2: getTipPoint(rightDetections)
      };
    } catch (err) {
      console.error('Detection error:', err);
      return { player1: null, player2: null };
    }
  }
}

export default SwordDetector;
