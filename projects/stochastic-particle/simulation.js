// Physical parameters
const alpha = 2.0;
const gamma = 1.0;
const D = 0.6;

const dt = 0.002;

// Physical domain
let XMAX = 10;

// Start at right edge
let x = XMAX;

// Gaussian noise
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function step() {
  const drift = -(alpha / gamma) * Math.sign(x);
  const noise = Math.sqrt(2 * D * dt) * randn();
  x += drift * dt + noise;
}
