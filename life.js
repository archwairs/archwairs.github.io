const canvas = document.getElementById("life-banner");
const ctx = canvas.getContext("2d");

// ---- Configuration ----
const CELL_SIZE = 8;
const STEP_INTERVAL = 100; // ms between generations (slower = calmer)

let cols, rows;
let grid;
let lastStep = 0;

// ---- Initialize canvas & grid ----
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = canvas.offsetHeight;

  cols = Math.floor(canvas.width / CELL_SIZE);
  rows = Math.floor(canvas.height / CELL_SIZE);

  randomizeGrid();
}

function randomizeGrid() {
  // Random density per load (keeps things organic)
  const density = 0.75 + Math.random() * 0.2;

  grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.random() > density ? 1 : 0
    )
  );
}

// ---- Game of Life logic ----
function step() {
  const next = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let neighbors = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const ny = y + dy;
          const nx = x + dx;

          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            neighbors += grid[ny][nx];
          }
        }
      }

      if (grid[y][x] === 1) {
        next[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        next[y][x] = (neighbors === 3) ? 1 : 0;
      }
    }
  }

  grid = next;
}

// ---- Rendering ----
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x]) {
        ctx.fillRect(
          x * CELL_SIZE,
          y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  }
}

// ---- Animation loop ----
function animate(timestamp) {
  if (timestamp - lastStep > STEP_INTERVAL) {
    step();
    lastStep = timestamp;
  }

  draw();
  requestAnimationFrame(animate);
}

// ---- Start ----
resize();
requestAnimationFrame(animate);

window.addEventListener("resize", resize);
