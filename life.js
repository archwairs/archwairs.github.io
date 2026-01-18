const canvas = document.getElementById("life-banner");
const ctx = canvas.getContext("2d");

const CELL_SIZE = 6;
const UPDATE_INTERVAL = 200; // ms

let cols, rows, grid;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = canvas.offsetHeight;

  cols = Math.floor(canvas.width / CELL_SIZE);
  rows = Math.floor(canvas.height / CELL_SIZE);

  grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.7 ? 1 : 0)
  );
}

window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x]) {
        ctx.fillStyle = "#6f4c35"; // warm accent
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

function nextGeneration() {
  const next = grid.map(arr => [...arr]);

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

      if (grid[y][x] === 1 && (neighbors < 2 || neighbors > 3)) {
        next[y][x] = 0;
      }
      if (grid[y][x] === 0 && neighbors === 3) {
        next[y][x] = 1;
      }
    }
  }

  grid = next;
}

function loop() {
  draw();
  nextGeneration();
}

setInterval(loop, UPDATE_INTERVAL);
