const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width, height;
let scale; // physical units → pixels

function resize() {
  width = canvas.clientWidth || window.innerWidth - 48;
  height = 200;

  canvas.width = width;
  canvas.height = height;

  scale = width / 20; // show x in [-10, 10]
}

window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // axis
  ctx.strokeStyle = "#6f685f";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  // particle
  const px = centerX + x * scale;

  ctx.fillStyle = "#6f4c35";
  ctx.beginPath();
  ctx.arc(px, centerY, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function animate() {
  step();
  draw();
  requestAnimationFrame(animate);
}

animate();
