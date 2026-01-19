const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width, height, scale, particleRadius;

// Resize logic
function resize() {
  width = canvas.clientWidth || window.innerWidth - 32;
  height = Math.max(180, Math.min(260, window.innerHeight * 0.25));

  canvas.width = width;
  canvas.height = height;

  // Dynamic physical range
  X_MAX = width / 60; // ≈ 15 on desktop, smaller on mobile
  scale = width / (2 * X_MAX);

  // Scale particle size with screen
  particleRadius = Math.max(5, height * 0.06);

  // Reset particle at edge on resize
  x = X_MAX;
}

window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Axis
  ctx.strokeStyle = "#6f685f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.stroke();

  // Particle position
  const px = cx + x * scale;

  if (px >= -particleRadius && px <= width + particleRadius) {
    ctx.fillStyle = "#d9a441";
    ctx.beginPath();
    ctx.arc(px, cy, particleRadius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function animate() {
  // Many small physics steps → smooth
  for (let i = 0; i < 12; i++) {
    step();
  }

  draw();
  requestAnimationFrame(animate);
}

animate();
