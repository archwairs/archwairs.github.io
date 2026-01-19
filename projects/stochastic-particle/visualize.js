const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Visible physical window
const X_MAX = 15;

// Rendering state
let width, height, scale;

function resize() {
  width = canvas.clientWidth || window.innerWidth - 48;
  height = 200;

  canvas.width = width;
  canvas.height = height;

  scale = width / (2 * X_MAX);
}

window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Axis
  ctx.strokeStyle = "#6f685f";
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.stroke();

  // Particle
  const px = cx + x * scale;

  if (px >= 0 && px <= width) {
    ctx.fillStyle = "#6f4c35";
    ctx.beginPath();
    ctx.arc(px, cy, 6, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function animate() {
  // Speed-up: multiple physics steps per frame
  for (let i = 0; i < 5; i++) {
    step();
  }

  draw();
  requestAnimationFrame(animate);
}

animate();
