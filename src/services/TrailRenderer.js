class TrailRenderer {
  constructor() {
    this.player1Trail = [];
    this.player2Trail = [];
    this.maxTrailLength = 120;
  }

  addFrame(detections, settings = {}) {
    const {
      player1Color = '#FF006E',
      player2Color = '#00D9FF',
      trailLength = 30
    } = settings;

    this.maxTrailLength = trailLength;

    // Add new detection points
    if (detections.player1) {
      this.player1Trail.push({
        ...detections.player1,
        timestamp: Date.now(),
        color: player1Color
      });
    }

    if (detections.player2) {
      this.player2Trail.push({
        ...detections.player2,
        timestamp: Date.now(),
        color: player2Color
      });
    }

    // Trim trails to max length
    if (this.player1Trail.length > this.maxTrailLength) {
      this.player1Trail = this.player1Trail.slice(-this.maxTrailLength);
    }

    if (this.player2Trail.length > this.maxTrailLength) {
      this.player2Trail = this.player2Trail.slice(-this.maxTrailLength);
    }
  }

  render(ctx, canvasWidth, canvasHeight) {
    // Render Player 1 Trail
    this.renderTrail(ctx, this.player1Trail, '#FF006E');

    // Render Player 2 Trail
    this.renderTrail(ctx, this.player2Trail, '#00D9FF');

    // Render current tip points
    this.renderTips(ctx);
  }

  renderTrail(ctx, trail, color) {
    if (trail.length < 2) return;

    // Draw trail with gradient fade effect
    for (let i = 0; i < trail.length - 1; i++) {
      const point = trail[i];
      const nextPoint = trail[i + 1];

      if (!point || !nextPoint) continue;

      // Calculate opacity based on position in trail (older = more transparent)
      const alpha = (i / trail.length) * 0.7;

      // Draw line segment
     ctx.save();

ctx.strokeStyle = color;
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.lineJoin = "round";

ctx.beginPath();

ctx.moveTo(trail[0].x, trail[0].y);

for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
}
ctx.shadowBlur = 20;
ctx.shadowColor = color;
ctx.stroke();

ctx.restore();
    }

    // Draw glow effect on trail
    for (let i = Math.max(0, trail.length - 10); i < trail.length; i++) {
      const point = trail[i];
      if (!point) continue;

      const alpha = (i / trail.length) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      
      // Draw glow circles
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderTips(ctx) {
    // Render Player 1 tip
    if (this.player1Trail.length > 0) {
      const tip1 = this.player1Trail[this.player1Trail.length - 1];
      this.drawTipMarker(ctx, tip1, '#FF006E', 'P1');
    }

    // Render Player 2 tip
    if (this.player2Trail.length > 0) {
      const tip2 = this.player2Trail[this.player2Trail.length - 1];
      this.drawTipMarker(ctx, tip2, '#00D9FF', 'P2');
    }
  }

  drawTipMarker(ctx, point, color, label) {
    ctx.save();

    // Draw outer glow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw main circle
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, point.x, point.y - 25);

    // Draw confidence score if available
    if (point.score) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px Arial';
      ctx.fillText(`${(point.score * 100).toFixed(0)}%`, point.x, point.y + 25);
    }

    ctx.restore();
  }

  clear() {
    this.player1Trail = [];
    this.player2Trail = [];
  }

  getTrailData() {
    return {
      player1: this.player1Trail,
      player2: this.player2Trail
    };
  }

  setColors(player1Color, player2Color) {
    // Update all trail points
    this.player1Trail.forEach(point => {
      point.color = player1Color;
    });

    this.player2Trail.forEach(point => {
      point.color = player2Color;
    });
  }
}

export default TrailRenderer;
