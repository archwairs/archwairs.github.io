const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W, H;
let scale;
let particleR;

// Resize & mapping
function resize() {
  W = canvas.clientWidth;
  H = canvas.clientHeight;

  canvas.width = W;
  canvas.height = H;

  // Physical window depends on screen
  XMAX = 10;
  scale = W / (2 * XMAX);

  particleR = Math.max(6, H * 0.08);

  // Reset particle to right edge
  x = XMAX;
}

window.addEventListener("resize", resize);
resize();

// Rendering
function draw() {
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;

  // Axis
  ctx.strokeStyle = "#6f685f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  // Particle
  const px = cx + x * scale;

  ctx.fillStyle = "#d9a441";
  ctx.beginPath();
  ctx.arc(px, cy, particleR, 0, Math.PI * 2);
  ctx.fill();
}

// Animation loop
function animate() {
  // Many small steps → smooth
  for (let i = 0; i < 20; i++) step();

  draw();
  requestAnimationFrame(animate);
}

animate();
