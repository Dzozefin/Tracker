import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

class SwordDetector {
  constructor() {
    this.landmarker = null;
    this.initializing = false;
  }

  async loadModel() {
    if (this.landmarker) return;

    if (this.initializing) {
      while (this.initializing) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    this.initializing = true;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    this.landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task"
      },
      runningMode: "VIDEO",
      numPoses: 1
    });

    this.initializing = false;
  }

  estimateTip(wrist, elbow) {
    if (!wrist || !elbow) return null;

    const vx = wrist.x - elbow.x;
    const vy = wrist.y - elbow.y;

    // przedłużenie ręki = szpada
    return {
      x: wrist.x + vx * 1.8,
      y: wrist.y + vy * 1.8,
      score: 1
    };
  }

  async detect(videoElement) {
    try {
      await this.loadModel();

      if (!this.landmarker || !videoElement) {
        return { player1: null, player2: null };
      }

      const result = this.landmarker.detectForVideo(
        videoElement,
        performance.now()
      );

      const landmarks = result.landmarks?.[0];

      if (!landmarks) {
        return { player1: null, player2: null };
      }

      // MediaPipe Pose keypoints:
      // 15 = left wrist
      // 13 = left elbow
      // 16 = right wrist
      // 14 = right elbow

      const leftWrist = landmarks[15];
      const leftElbow = landmarks[13];

      const rightWrist = landmarks[16];
      const rightElbow = landmarks[14];

      const player1 = this.estimateTip(leftWrist, leftElbow);
      const player2 = this.estimateTip(rightWrist, rightElbow);

      return { player1, player2 };
    } catch (err) {
      console.error("Pose detection error:", err);
      return { player1: null, player2: null };
    }
  }
}

export default SwordDetector;
