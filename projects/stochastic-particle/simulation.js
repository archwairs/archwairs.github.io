// Parameters
const alpha = 1.0;
const gamma = 1.0;
const D = 1.0;
const dt = 0.01;

// State
let x = 200; // initial position (pixels)

// Gaussian noise (Box–Muller)
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// One time step
function step() {
  const drift = -(alpha / gamma) * Math.sign(x);
  const noise = Math.sqrt(2 * D * dt) * randn();
  x += drift * dt + noise;
}
