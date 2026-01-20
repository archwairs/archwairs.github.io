let canvas;
let angleSlider, lengthSlider;

let baseLength;
let theta;

function setup() {
  // Responsive canvas size
  const size = Math.min(windowWidth * 0.9, 400);
  canvas = createCanvas(size, size);
  canvas.parent("canvas-container");

  // Sliders
  angleSlider = select("#angleSlider");
  lengthSlider = select("#lengthSlider");

  angleSlider.value(Math.PI / 8);
  lengthSlider.value(0.33);

  stroke(getComputedStyle(document.documentElement)
    .getPropertyValue("--text"));
  strokeWeight(2);
  noFill();
}

function windowResized() {
  const size = Math.min(windowWidth * 0.9, 400);
  resizeCanvas(size, size);
}

function draw() {
  background(getComputedStyle(document.documentElement)
    .getPropertyValue("--bg"));

  theta = angleSlider.value();
  baseLength = height * lengthSlider.value();

  translate(width / 2, height);
  tree(baseLength);
}

function tree(r) {
  if (r < 6) return;

  line(0, 0, 0, -r);
  translate(0, -r);

  push();
  rotate(theta);
  tree(r / 1.5);
  pop();

  push();
  rotate(-theta);
  tree(r / 1.5);
  pop();
}
