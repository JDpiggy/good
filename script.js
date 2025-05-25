document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // Control elements
    const shapeTypeInput = document.getElementById('shapeType');
    const numShapesInput = document.getElementById('numShapes');
    const maxSpeedInput = document.getElementById('maxSpeed');
    const maxSizeInput = document.getElementById('maxSize');
    const gravityInput = document.getElementById('gravity');
    const bounceFactorInput = document.getElementById('bounceFactor');
    const maxSpinInput = document.getElementById('maxSpin');
    const resetButton = document.getElementById('resetButton');

    // Value display spans
    const numShapesValueSpan = document.getElementById('numShapesValue');
    const maxSpeedValueSpan = document.getElementById('maxSpeedValue');
    const maxSizeValueSpan = document.getElementById('maxSizeValue');
    const gravityValueSpan = document.getElementById('gravityValue');
    const bounceFactorValueSpan = document.getElementById('bounceFactorValue');
    const maxSpinValueSpan = document.getElementById('maxSpinValue');

    let shapes = [];
    let animationFrameId;

    function resizeCanvas() {
        const simArea = document.querySelector('.simulation-area');
        const controlsContainer = document.querySelector('.controls-container');
        let availableWidth = window.innerWidth;
        if (window.innerWidth > 768) { // If controls are on the side
            availableWidth -= controlsContainer.offsetWidth;
        }
        
        const padding = 40; // Total padding in simulation-area
        canvas.width = Math.min(availableWidth - padding, 1000); 
        canvas.height = Math.min(simArea.offsetHeight - padding, 700);
        
        // Fallback if offsetHeight is 0 (e.g. display:none initially)
        if (canvas.height < 100) canvas.height = window.innerHeight * 0.6;
        if (canvas.width < 100) canvas.width = window.innerWidth * 0.6;


        initSimulation();
    }

    window.addEventListener('resize', resizeCanvas);

    class Shape {
        constructor(x, y, size, dx, dy, color, shapeType, angularVelocity) {
            this.x = x;
            this.y = y;
            this.size = size; // General size parameter
            this.dx = dx;
            this.dy = dy;
            this.color = color;
            this.shapeType = shapeType;
            this.angle = Math.random() * Math.PI * 2; // Initial random angle
            this.angularVelocity = angularVelocity;
            
            // For rectangles, store width/height based on size
            if (this.shapeType === 'rectangle') {
                const aspect = Math.random() * 0.8 + 0.4; // Random aspect ratio (0.4 to 1.2)
                if (Math.random() < 0.5) { // Taller or wider
                    this.width = this.size;
                    this.height = this.size * aspect;
                } else {
                    this.width = this.size * aspect;
                    this.height = this.size;
                }
            } else { // For squares and others where width/height are same as size
                this.width = this.size;
                this.height = this.size;
            }
            this.mass = (this.width * this.height) * 0.005; // Mass loosely based on area
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'; // Slight outline
            ctx.lineWidth = 1;

            switch (this.shapeType) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    break;
                case 'square':
                    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                    ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
                    break;
                case 'rectangle':
                    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
                    break;
                case 'dodecahedron':
                    const sides = 12;
                    const radius = this.size / 2;
                    ctx.beginPath();
                    ctx.moveTo(radius * Math.cos(0), radius * Math.sin(0));
                    for (let i = 1; i <= sides; i++) {
                        ctx.lineTo(radius * Math.cos(i * 2 * Math.PI / sides),
                                   radius * Math.sin(i * 2 * Math.PI / sides));
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;
                case 'f35':
                    this.drawF35();
                    break;
                case 'pig':
                    this.drawPig();
                    break;
            }
            ctx.restore();
        }
        
        // Simplified F-35 (points define a path scaled by this.size)
        drawF35() {
            const s = this.size / 20; // Scale factor
            ctx.beginPath();
            // Body and nose
            ctx.moveTo(0 * s, -10 * s); // Nose tip
            ctx.lineTo(2 * s, -3 * s);
            ctx.lineTo(1.5 * s, 2 * s);
            ctx.lineTo(5 * s, 5 * s);   // Wing front
            ctx.lineTo(7 * s, 4 * s);   // Wing tip
            ctx.lineTo(3 * s, 2.5 * s);
            ctx.lineTo(3.5 * s, 7 * s); // Tail wing
            ctx.lineTo(2.5 * s, 8 * s); // Tail tip
            ctx.lineTo(1.5 * s, 6 * s);
            ctx.lineTo(0 * s, 7 * s);   // Exhaust center
            // Mirror (simplified)
            ctx.lineTo(-1.5 * s, 6 * s);
            ctx.lineTo(-2.5 * s, 8 * s);
            ctx.lineTo(-3.5 * s, 7 * s);
            ctx.lineTo(-3 * s, 2.5 * s);
            ctx.lineTo(-7 * s, 4 * s);
            ctx.lineTo(-5 * s, 5 * s);
            ctx.lineTo(-1.5 * s, 2 * s);
            ctx.lineTo(-2 * s, -3 * s);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Simplified Pig
        drawPig() {
            const s = this.size / 20; // Scale factor
            ctx.beginPath();
            // Head / Snout
            ctx.ellipse(0, 0, 7*s, 5*s, 0, 0, Math.PI * 2); // Main body
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath(); // Snout
            ctx.ellipse(-6*s, 0, 2.5*s, 2*s, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath(); // Ear 1
            ctx.moveTo(1*s, -4*s);
            ctx.quadraticCurveTo(3*s, -7*s, 5*s, -5*s);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath(); // Ear 2
            ctx.moveTo(0*s, -4.5*s);
            ctx.quadraticCurveTo(1.5*s, -7.5*s, 3.5*s, -5.5*s);
            ctx.fill();
            ctx.stroke();
            
            // Tiny legs (simple rects, not rotated with body for extreme simplicity here)
            // To do them properly, they'd need to be part of the main rotated context
            // For now, let's skip legs to keep it simpler or make them very abstract.
            // The current ctx.translate/rotate applies to all drawing within this drawPig() call
            // So if we draw legs, they WILL rotate with the body.
            ctx.fillRect(-3*s, 4*s, 1.5*s, 3*s); // Front leg
            ctx.fillRect(1*s, 4*s, 1.5*s, 3*s);  // Back leg
        }


        update() {
            this.dy += parseFloat(gravityInput.value);
            this.x += this.dx;
            this.y += this.dy;
            this.angle += this.angularVelocity;

            const bounce = parseFloat(bounceFactorInput.value);
            // Collision detection uses this.size / 2 as a general radius.
            // This is an approximation for non-circular shapes.
            const effectiveRadius = Math.max(this.width, this.height) / 2;


            if (this.x + effectiveRadius > canvas.width) {
                this.x = canvas.width - effectiveRadius;
                this.dx *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dx)/maxSpeedInput.value); // Spin on bounce
            }
            if (this.x - effectiveRadius < 0) {
                this.x = effectiveRadius;
                this.dx *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dx)/maxSpeedInput.value);
            }
            if (this.y + effectiveRadius > canvas.height) {
                this.y = canvas.height - effectiveRadius;
                this.dy *= -bounce;
                this.dx *= 0.98; // Friction on ground
                this.angularVelocity *= 0.95; // Dampen spin on ground
                if (Math.abs(this.dy) < 0.1) this.dy = 0; // Settle
            }
            if (this.y - effectiveRadius < 0) {
                this.y = effectiveRadius;
                this.dy *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dy)/maxSpeedInput.value);
            }
        }
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 200 + 55);
        const g = Math.floor(Math.random() * 200 + 55);
        const b = Math.floor(Math.random() * 200 + 55);
        return `rgb(${r},${g},${b})`;
    }

    function initSimulation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        shapes = [];
        const numShapes = parseInt(numShapesInput.value);
        const maxSpeed = parseFloat(maxSpeedInput.value);
        const SmaxSize = parseFloat(maxSizeInput.value); // S for Shape
        const minSize = SmaxSize * 0.3 < 10 ? SmaxSize * 0.3 : 10; // Minimum shape size
        const currentShapeType = shapeTypeInput.value;
        const currentMaxSpin = parseFloat(maxSpinInput.value);

        for (let i = 0; i < numShapes; i++) {
            const size = Math.random() * (SmaxSize - minSize) + minSize;
            // Calculate effective radius for initial placement based on shape type
            // For simplicity, we'll use 'size' as a general proxy for diameter here.
            // More accurate would be to calculate bounding box after rotation if known,
            // but for random initial spawn, 'size' is a good enough estimate.
            const spawnMargin = size / 1.8; // ensure even rotated shapes spawn inside

            const x = Math.random() * (canvas.width - 2 * spawnMargin) + spawnMargin;
            const y = Math.random() * (canvas.height - 2 * spawnMargin) + spawnMargin;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 0.2;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const color = getRandomColor();
            const angularVelocity = (Math.random() - 0.5) * 2 * currentMaxSpin;

            shapes.push(new Shape(x, y, size, dx, dy, color, currentShapeType, angularVelocity));
        }
        if (!animationFrameId || shapes.length > 0) { // Start animation if not already running or if shapes exist
             animate();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        shapes.forEach(shape => {
            shape.update();
            shape.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    function setupEventListeners() {
        const inputsToReset = [numShapesInput, maxSpeedInput, maxSizeInput, shapeTypeInput, maxSpinInput];
        inputsToReset.forEach(input => {
            input.addEventListener('input', () => {
                updateDisplayValues();
                // Debounce or delay initSimulation if performance is an issue for rapid slider changes
                // For now, direct call is fine.
                initSimulation(); 
            });
        });

        const liveUpdateInputs = [gravityInput, bounceFactorInput];
        liveUpdateInputs.forEach(input => {
            input.addEventListener('input', updateDisplayValues);
        });

        resetButton.addEventListener('click', () => {
            // Ensure display values are current before re-init
            updateDisplayValues(); 
            initSimulation();
        });
    }
    
    function updateDisplayValues() {
        numShapesValueSpan.textContent = numShapesInput.value;
        maxSpeedValueSpan.textContent = parseFloat(maxSpeedInput.value).toFixed(1);
        maxSizeValueSpan.textContent = maxSizeInput.value;
        gravityValueSpan.textContent = parseFloat(gravityInput.value).toFixed(2);
        bounceFactorValueSpan.textContent = parseFloat(bounceFactorInput.value).toFixed(2);
        maxSpinValueSpan.textContent = parseFloat(maxSpinInput.value).toFixed(3);
    }

    // Initial setup
    updateDisplayValues(); // Set initial display values from defaults
    resizeCanvas(); // Set initial canvas size and start simulation
    setupEventListeners();
});
