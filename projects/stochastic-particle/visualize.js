const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W, H, scale, particleR;

function resize() {
  W = canvas.clientWidth;
  H = canvas.clientHeight;

  canvas.width = W;
  canvas.height = H;

  XMAX = 10;
  scale = W / (2 * XMAX);
  particleR = Math.max(6, H * 0.08);

  x = XMAX;
}

window.addEventListener("resize", resize);
resize();

// Click / touch
canvas.addEventListener("pointerdown", e => {
  const rect = canvas.getBoundingClientRect();
  resetAt(e.clientX - rect.left, rect.width);
});

// Sliders
const alphaSlider = document.getElementById("alpha");
const DSlider = document.getElementById("D");

alphaSlider.oninput = e => {
  alpha = parseFloat(e.target.value);
  document.getElementById("alphaVal").textContent = alpha.toFixed(1);
};

DSlider.oninput = e => {
  D = parseFloat(e.target.value);
  document.getElementById("DVal").textContent = D.toFixed(2);
};

function draw() {
  // Fade instead of clear → smooth
  ctx.fillStyle = "rgba(235,232,228,0.15)";
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;

  const px = cx + x * scale;

  ctx.fillStyle = "#6f4c35";
  ctx.beginPath();
  ctx.arc(px, cy, particleR, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  for (let i = 0; i < 15; i++) step();
  draw();
  requestAnimationFrame(animate);
}

animate();
