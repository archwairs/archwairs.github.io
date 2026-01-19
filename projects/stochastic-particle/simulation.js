// Simple Stochastic Simulation - High Quality Version
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
let particleCanvas, particleCtx;
let msdCanvas, msdCtx;
let distCanvas, distCtx;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing...");
    
    // Initialize canvases with high DPI
    initHighQualityCanvases();
    
    // Initialize particles
    initParticles();
    
    // Setup controls
    setupControls();
    
    // Start animation
    requestAnimationFrame(animate);
    
    console.log("Initialization complete!");
});

function initHighQualityCanvases() {
    console.log("Initializing high-quality canvases...");
    
    // Create high DPI canvases
    particleCanvas = createHighDPICanvas('particle-canvas');
    msdCanvas = createHighDPICanvas('msd-canvas');
    distCanvas = createHighDPICanvas('distribution-canvas');
    
    if (particleCanvas) particleCtx = particleCanvas.ctx;
    if (msdCanvas) msdCtx = msdCanvas.ctx;
    if (distCanvas) distCtx = distCanvas.ctx;
    
    console.log("High-quality canvases created");
}

function createHighDPICanvas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return null;
    }
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = 300;
    
    if (width <= 0 || height <= 0) {
        console.warn(`Container ${containerId} has invalid dimensions: ${width}x${height}`);
        return null;
    }
    
    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Clear container
    container.innerHTML = '';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set display size (CSS pixels)
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.display = 'block';
    
    // Set actual size in memory (scaled for device pixel ratio)
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    
    // Scale all drawing operations by dpr
    ctx.scale(dpr, dpr);
    
    // Store the scale factor
    ctx.dpr = dpr;
    ctx.cssWidth = width;
    ctx.cssHeight = height;
    
    // Add to container
    container.appendChild(canvas);
    
    console.log(`${containerId}: ${width}x${height} (CSS), ${canvas.width}x${canvas.height} (actual), DPR: ${dpr}`);
    
    return { canvas, ctx, dpr, cssWidth: width, cssHeight: height };
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        console.log("Window resized, recreating canvases...");
        initHighQualityCanvases();
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
    
    const ctx = particleCtx;
    const width = ctx.cssWidth;
    const height = ctx.cssHeight;
    const centerX = width / 2;
    const scale = width / 40;
    
    // Clear with exact dimensions
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ebe8e4';
    ctx.fillRect(0, 0, width, height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(111, 76, 53, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // Draw x-axis
    ctx.strokeStyle = 'rgba(111, 76, 53, 0.2)';
    ctx.beginPath();
    ctx.moveTo(30, height/2);
    ctx.lineTo(width - 30, height/2);
    ctx.stroke();
    
    // Draw particles
    const step = Math.max(1, Math.floor(params.N / 200));
    
    // Pre-calculate colors for better performance
    for (let i = 0; i < particles.length; i += step) {
        const p = particles[i];
        const x = centerX + p.x * scale;
        
        // Brown color based on position - using HSL for better control
        const hue = 25; // Brown base hue
        const saturation = 40 + Math.abs(p.x) * 2;
        const lightness = 50 - Math.abs(p.x) * 1;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        ctx.beginPath();
        ctx.arc(x, height/2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw labels
    ctx.fillStyle = '#1d1914';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position markers
    const positions = [-15, -10, -5, 0, 5, 10, 15];
    positions.forEach(pos => {
        const x = centerX + pos * scale;
        ctx.fillText(pos.toString(), x, height/2 + 25);
    });
    
    // Axis label
    ctx.fillText('Position (x)', width / 2, height - 15);
    
    // Draw time indicator
    ctx.fillStyle = 'rgba(111, 76, 53, 0.7)';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${time.toFixed(1)}`, 10, 20);
}

function drawMSD() {
    if (!msdCtx || msdData.length < 2) return;
    
    const ctx = msdCtx;
    const width = ctx.cssWidth;
    const height = ctx.cssHeight;
    const padding = Math.max(40, width * 0.05);
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    const maxTime = Math.max(time, 1);
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ebe8e4';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(111, 76, 53, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let i = 1; i < 5; i++) {
        const x = padding + (plotWidth * i) / 5;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
        const y = height - padding - (plotHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(111, 76, 53, 0.6)';
    ctx.lineWidth = 1.5;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw MSD curve with smooth line
    ctx.strokeStyle = '#6f4c35';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    for (let i = 0; i < msdData.length; i++) {
        const data = msdData[i];
        const x = padding + (data.time / maxTime) * plotWidth;
        const y = height - padding - (data.msd / maxMSD) * plotHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // Smooth curve
            const prevData = msdData[i-1];
            const prevX = padding + (prevData.time / maxTime) * plotWidth;
            const prevY = height - padding - (prevData.msd / maxMSD) * plotHeight;
            
            const cpX1 = prevX + (x - prevX) * 0.5;
            const cpY1 = prevY;
            const cpX2 = cpX1;
            const cpY2 = y;
            
            ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
        }
    }
    
    ctx.stroke();
    
    // Draw current point
    if (msdData.length > 0) {
        const last = msdData[msdData.length - 1];
        const currentX = padding + (last.time / maxTime) * plotWidth;
        const currentY = height - padding - (last.msd / maxMSD) * plotHeight;
        
        // Glow effect
        ctx.shadowColor = 'rgba(111, 76, 53, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#6f4c35';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Inner point
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw axis labels
    ctx.fillStyle = '#1d1914';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X-axis labels (time)
    for (let i = 0; i <= 5; i++) {
        const x = padding + (plotWidth * i) / 5;
        const timeValue = (maxTime * i) / 5;
        ctx.fillText(timeValue.toFixed(1), x, height - padding + 8);
    }
    
    // X-axis title
    ctx.fillText('Time', width / 2, height - padding + 25);
    
    // Y-axis labels (MSD)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (plotHeight * i) / 5;
        const msdValue = (maxMSD * i) / 5;
        ctx.fillText(msdValue.toFixed(1), padding - 10, y);
    }
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('MSD', 0, 0);
    ctx.restore();
    
    // Title
    ctx.fillStyle = 'rgba(111, 76, 53, 0.8)';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Mean-Squared Displacement', padding, padding - 5);
}

function drawDistribution() {
    if (!distCtx) return;
    
    const ctx = distCtx;
    const width = ctx.cssWidth;
    const height = ctx.cssHeight;
    const padding = Math.max(40, width * 0.05);
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
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ebe8e4';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(111, 76, 53, 0.6)';
    ctx.lineWidth = 1.5;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw bars with gradient
    const barSpacing = 1;
    const barPlotWidth = plotWidth / bins;
    
    for (let i = 0; i < bins; i++) {
        const x = -15 + (i + 0.5) * binWidth;
        const d = density[i];
        
        const xPos = padding + ((x + 15) / 30) * plotWidth;
        const barHeight = (d / maxDensity) * plotHeight * 0.8;
        
        // Create gradient for bar
        const gradient = ctx.createLinearGradient(0, height - padding - barHeight, 0, height - padding);
        gradient.addColorStop(0, 'rgba(111, 76, 53, 0.9)');
        gradient.addColorStop(1, 'rgba(111, 76, 53, 0.5)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            xPos - barPlotWidth/2 + barSpacing/2, 
            height - padding - barHeight, 
            barPlotWidth - barSpacing, 
            barHeight
        );
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(111, 76, 53, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
            xPos - barPlotWidth/2 + barSpacing/2, 
            height - padding - barHeight, 
            barPlotWidth - barSpacing, 
            barHeight
        );
    }
    
    // Draw theoretical equilibrium distribution line
    ctx.strokeStyle = 'rgba(180, 60, 60, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    
    const alpha = params.alpha;
    const gamma = params.gamma;
    const D = params.D;
    const equilibriumMax = (alpha / (2 * gamma * D));
    
    for (let x = -14.5; x <= 14.5; x += 0.5) {
        const y = (alpha / (2 * gamma * D)) * Math.exp(-alpha * Math.abs(x) / (gamma * D));
        const xPos = padding + ((x + 15) / 30) * plotWidth;
        const yPos = height - padding - (y / equilibriumMax) * plotHeight * 0.8;
        
        if (x === -14.5) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw axis labels
    ctx.fillStyle = '#1d1914';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X-axis labels
    const positions = [-15, -10, -5, 0, 5, 10, 15];
    positions.forEach(pos => {
        const xPos = padding + ((pos + 15) / 30) * plotWidth;
        ctx.fillText(pos.toString(), xPos, height - padding + 8);
    });
    
    // X-axis title
    ctx.fillText('Position (x)', width / 2, height - padding + 25);
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (plotHeight * i) / 5;
        const densityValue = (maxDensity * i) / 5 / densityScale;
        ctx.fillText(densityValue.toFixed(2), padding - 10, y);
    }
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Probability Density', 0, 0);
    ctx.restore();
    
    // Title and legend
    ctx.fillStyle = 'rgba(111, 76, 53, 0.8)';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Probability Distribution', padding, padding - 5);
    
    // Legend for equilibrium line
    ctx.fillStyle = 'rgba(180, 60, 60, 0.8)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Equilibrium distribution', width - 180, padding + 20);
    
    // Draw legend line
    ctx.strokeStyle = 'rgba(180, 60, 60, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(width - 185, padding + 20);
    ctx.lineTo(width - 155, padding + 20);
    ctx.stroke();
    ctx.setLineDash([]);
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
