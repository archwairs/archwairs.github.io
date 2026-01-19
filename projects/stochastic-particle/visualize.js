const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const centerY = canvas.height / 2;
const centerX = canvas.width / 2;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // axis
  ctx.strokeStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();

  // particle
  ctx.fillStyle = "#f4b183";
  ctx.beginPath();
  ctx.arc(centerX + x, centerY, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function animate() {
  step();
  draw();
  requestAnimationFrame(animate);
}

animate();
