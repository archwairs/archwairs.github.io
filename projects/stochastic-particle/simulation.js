// Simple Stochastic Simulation
console.log("simulation.js loading...");

// Simulation state
let particles = [];
let msdData = [];
let time = 0;
let isRunning = true;
let maxMSD = 0;
let peakTime = 0;

// Parameters
let params = {
    N: 500,
    dt: 0.01,
    x_prime: 10.0,
    alpha: 1.0,
    gamma: 1.0,
    D: 1.0
};

// Canvas references
let particleCtx;
let msdCtx;
let distCtx;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing...");
    
    // Initialize canvases
    initCanvases();
    
    // Initialize particles
    initParticles();
    
    // Setup controls
    setupControls();
    
    // Start animation
    requestAnimationFrame(animate);
    
    console.log("Initialization complete!");
});

function initCanvases() {
    console.log("Initializing canvases...");
    
    // Create responsive canvases
    createCanvasForContainer('particle-canvas', 'particle');
    createCanvasForContainer('msd-canvas', 'msd');
    createCanvasForContainer('distribution-canvas', 'distribution');
    
    console.log("Canvases created");
}

function createCanvasForContainer(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Get container dimensions
    const width = container.clientWidth || 800;
    const height = 300;
    
    // Clear container
    container.innerHTML = '';
    
    // Create canvas with exact pixel dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    // Add to container
    container.appendChild(canvas);
    
    // Store context reference
    const ctx = canvas.getContext('2d');
    
    if (type === 'particle') {
        particleCtx = ctx;
        console.log(`Particle canvas: ${width}x${height}`);
    } else if (type === 'msd') {
        msdCtx = ctx;
        console.log(`MSD canvas: ${width}x${height}`);
    } else if (type === 'distribution') {
        distCtx = ctx;
        console.log(`Distribution canvas: ${width}x${height}`);
    }
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        console.log("Window resized, recreating canvases...");
        initCanvases();
        // Redraw immediately
        drawEverything();
    }, 250);
});

function initParticles() {
    particles = [];
    for (let i = 0; i < params.N; i++) {
        particles.push({
            x: params.x_prime,
            y: 150 + Math.random() * 100 - 50
        });
    }
    msdData = [];
    time = 0;
    maxMSD = 0;
    peakTime = 0;
    
    updateStatsDisplay();
}

function animate() {
    if (isRunning) {
        updatePhysics();
        time += params.dt;
        updateStatistics();
        drawEverything();
    }
    requestAnimationFrame(animate);
}

function updatePhysics() {
    const dt = params.dt;
    const alpha_over_gamma = params.alpha / params.gamma;
    const noiseScale = Math.sqrt(2 * params.D * dt);
    
    for (let p of particles) {
        const drift = -alpha_over_gamma * Math.sign(p.x);
        const noise = noiseScale * gaussianRandom();
        p.x += drift * dt + noise;
        
        // Keep within bounds
        if (Math.abs(p.x) > 25) p.x = 25 * Math.sign(p.x);
    }
}

function updateStatistics() {
    // Calculate mean and MSD
    let sumX = 0, sumX2 = 0;
    
    for (let p of particles) {
        sumX += p.x;
        sumX2 += p.x * p.x;
    }
    
    const meanX = sumX / params.N;
    const msd = (sumX2 / params.N) - (meanX * meanX);
    
    // Store MSD data
    msdData.push({
        time: time,
        msd: msd,
        meanX: meanX
    });
    
    if (msdData.length > 200) msdData.shift();
    
    // Update peak
    if (msd > maxMSD) {
        maxMSD = msd;
        peakTime = time;
    }
    
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('time-value').textContent = time.toFixed(1);
    
    if (msdData.length > 0) {
        const last = msdData[msdData.length - 1];
        document.getElementById('mean-x-value').textContent = last.meanX.toFixed(3);
        document.getElementById('variance-value').textContent = last.msd.toFixed(3);
    }
    
    document.getElementById('max-msd-value').textContent = maxMSD.toFixed(3);
    document.getElementById('peak-time-value').textContent = peakTime.toFixed(1);
}

function drawEverything() {
    drawParticles();
    drawMSD();
    drawDistribution();
}

function drawParticles() {
    if (!particleCtx) return;
    
    const canvas = particleCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const scale = width / 40; // Dynamic scaling based on canvas width
    
    // Clear
    particleCtx.fillStyle = '#ebe8e4';
    particleCtx.fillRect(0, 0, width, height);
    
    // Draw center line
    particleCtx.strokeStyle = 'rgba(111, 76, 53, 0.4)';
    particleCtx.lineWidth = 1;
    particleCtx.beginPath();
    particleCtx.moveTo(centerX, 0);
    particleCtx.lineTo(centerX, height);
    particleCtx.stroke();
    
    // Draw x-axis
    particleCtx.strokeStyle = 'rgba(111, 76, 53, 0.2)';
    particleCtx.beginPath();
    particleCtx.moveTo(50, height/2);
    particleCtx.lineTo(width - 50, height/2);
    particleCtx.stroke();
    
    // Draw particles
    const step = Math.max(1, Math.floor(params.N / 200));
    for (let i = 0; i < particles.length; i += step) {
        const p = particles[i];
        const x = centerX + p.x * scale;
        
        // Brown color based on position
        const brownIntensity = 150 - Math.abs(p.x) * 5;
        particleCtx.fillStyle = `rgb(111, ${Math.min(60, 20 + Math.abs(p.x) * 3)}, ${brownIntensity})`;
        
        particleCtx.beginPath();
        particleCtx.arc(x, height/2, 2, 0, Math.PI * 2);
        particleCtx.fill();
    }
    
    // Draw labels
    particleCtx.fillStyle = '#1d1914';
    particleCtx.font = '12px system-ui';
    particleCtx.textAlign = 'center';
    
    // Position markers
    [-15, -10, -5, 0, 5, 10, 15].forEach(pos => {
        const x = centerX + pos * scale;
        particleCtx.fillText(pos, x, height/2 + 20);
    });
    
    particleCtx.fillText('Position (x)', width / 2, height - 10);
}

function drawMSD() {
    if (!msdCtx || msdData.length < 2) return;
    
    const canvas = msdCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = Math.max(30, width * 0.05); // Responsive padding
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    const maxTime = Math.max(time, 1);
    
    // Clear
    msdCtx.fillStyle = '#ebe8e4';
    msdCtx.fillRect(0, 0, width, height);
    
    // Draw axes
    msdCtx.strokeStyle = 'rgba(111, 76, 53, 0.6)';
    msdCtx.lineWidth = 1;
    
    // X-axis
    msdCtx.beginPath();
    msdCtx.moveTo(padding, height - padding);
    msdCtx.lineTo(width - padding, height - padding);
    msdCtx.stroke();
    
    // Y-axis
    msdCtx.beginPath();
    msdCtx.moveTo(padding, padding);
    msdCtx.lineTo(padding, height - padding);
    msdCtx.stroke();
    
    // Draw MSD curve
    msdCtx.strokeStyle = '#6f4c35';
    msdCtx.lineWidth = 2;
    msdCtx.beginPath();
    
    for (let i = 0; i < msdData.length; i++) {
        const data = msdData[i];
        const x = padding + (data.time / maxTime) * plotWidth;
        const y = height - padding - (data.msd / maxMSD) * plotHeight;
        
        if (i === 0) {
            msdCtx.moveTo(x, y);
        } else {
            msdCtx.lineTo(x, y);
        }
    }
    
    msdCtx.stroke();
    
    // Draw current point
    if (msdData.length > 0) {
        const last = msdData[msdData.length - 1];
        const currentX = padding + (last.time / maxTime) * plotWidth;
        const currentY = height - padding - (last.msd / maxMSD) * plotHeight;
        
        msdCtx.fillStyle = '#6f4c35';
        msdCtx.beginPath();
        msdCtx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        msdCtx.fill();
    }
    
    // Draw labels
    msdCtx.fillStyle = '#1d1914';
    msdCtx.font = '11px system-ui';
    msdCtx.textAlign = 'center';
    
    // Time labels
    for (let i = 0; i <= 5; i++) {
        const x = padding + (plotWidth * i) / 5;
        const timeValue = (maxTime * i) / 5;
        msdCtx.fillText(timeValue.toFixed(1), x, height - padding + 20);
    }
    
    msdCtx.fillText('Time', width / 2, height - 10);
    
    // MSD labels
    msdCtx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (plotHeight * i) / 5;
        const msdValue = (maxMSD * i) / 5;
        msdCtx.fillText(msdValue.toFixed(1), padding - 8, y + 4);
    }
}

function drawDistribution() {
    if (!distCtx) return;
    
    const canvas = distCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = Math.max(30, width * 0.05);
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    
    // Calculate density
    const bins = 40;
    const binWidth = 30 / bins;
    const density = new Array(bins).fill(0);
    
    for (let p of particles) {
        const bin = Math.floor((p.x + 15) / binWidth);
        if (bin >= 0 && bin < bins) {
            density[bin]++;
        }
    }
    
    const maxDensity = Math.max(...density, 1);
    const densityScale = params.N * binWidth;
    
    // Clear
    distCtx.fillStyle = '#ebe8e4';
    distCtx.fillRect(0, 0, width, height);
    
    // Draw axes
    distCtx.strokeStyle = 'rgba(111, 76, 53, 0.6)';
    distCtx.lineWidth = 1;
    
    // X-axis
    distCtx.beginPath();
    distCtx.moveTo(padding, height - padding);
    distCtx.lineTo(width - padding, height - padding);
    distCtx.stroke();
    
    // Y-axis
    distCtx.beginPath();
    distCtx.moveTo(padding, padding);
    distCtx.lineTo(padding, height - padding);
    distCtx.stroke();
    
    // Draw bars
    const barWidth = plotWidth / bins;
    distCtx.fillStyle = 'rgba(111, 76, 53, 0.7)';
    
    for (let i = 0; i < bins; i++) {
        const x = -15 + (i + 0.5) * binWidth;
        const d = density[i];
        
        const xPos = padding + ((x + 15) / 30) * plotWidth;
        const barHeight = (d / maxDensity) * plotHeight * 0.8;
        
        distCtx.fillRect(xPos - barWidth/2, height - padding - barHeight, barWidth, barHeight);
    }
    
    // Draw labels
    distCtx.fillStyle = '#1d1914';
    distCtx.font = '11px system-ui';
    distCtx.textAlign = 'center';
    
    // X labels
    [-15, -10, -5, 0, 5, 10, 15].forEach(pos => {
        const xPos = padding + ((pos + 15) / 30) * plotWidth;
        distCtx.fillText(pos, xPos, height - padding + 20);
    });
    
    distCtx.fillText('Position (x)', width / 2, height - 10);
    
    // Y labels
    distCtx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (plotHeight * i) / 5;
        const densityValue = (maxDensity * i) / 5 / densityScale;
        distCtx.fillText(densityValue.toFixed(2), padding - 8, y + 4);
    }
}

function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function setupControls() {
    console.log("Setting up controls...");
    
    const sliders = [
        {id: 'N-slider', param: 'N', isInt: true},
        {id: 'x0-slider', param: 'x_prime', isInt: false},
        {id: 'alpha-slider', param: 'alpha', isInt: false},
        {id: 'gamma-slider', param: 'gamma', isInt: false}
    ];
    
    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        const valueElement = document.getElementById(slider.id.replace('-slider', '-value'));
        
        if (element && valueElement) {
            element.addEventListener('input', function() {
                const value = slider.isInt ? parseInt(this.value) : parseFloat(this.value);
                valueElement.textContent = slider.isInt ? value : value.toFixed(1);
                params[slider.param] = value;
                
                if (slider.param === 'N') {
                    initParticles();
                } else if (slider.param === 'x_prime') {
                    for (let p of particles) {
                        p.x = value;
                    }
                }
            });
        }
    });
    
    // Buttons
    document.getElementById('reset-btn').addEventListener('click', function() {
        initParticles();
        console.log("Simulation reset");
    });
    
    document.getElementById('pause-btn').addEventListener('click', function() {
        isRunning = !isRunning;
        this.textContent = isRunning ? 'Pause' : 'Resume';
        console.log(`Simulation ${isRunning ? 'resumed' : 'paused'}`);
    });
    
    console.log("Controls setup complete");
}
