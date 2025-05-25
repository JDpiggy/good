document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // Control elements
    const numBubblesInput = document.getElementById('numBubbles');
    const maxSpeedInput = document.getElementById('maxSpeed');
    const maxSizeInput = document.getElementById('maxSize');
    const gravityInput = document.getElementById('gravity');
    const bounceFactorInput = document.getElementById('bounceFactor');
    const resetButton = document.getElementById('resetButton');

    // Value display spans
    const numBubblesValueSpan = document.getElementById('numBubblesValue');
    const maxSpeedValueSpan = document.getElementById('maxSpeedValue');
    const maxSizeValueSpan = document.getElementById('maxSizeValue');
    const gravityValueSpan = document.getElementById('gravityValue');
    const bounceFactorValueSpan = document.getElementById('bounceFactorValue');

    let bubbles = [];
    let animationFrameId;

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = Math.min(window.innerWidth * 0.9, 800); // Adjust as needed
        canvas.height = Math.min(window.innerHeight * 0.6, 600); // Adjust as needed
        initSimulation(); // Re-initialize on resize
    }

    window.addEventListener('resize', resizeCanvas);

    // Bubble class
    class Bubble {
        constructor(x, y, radius, dx, dy, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.dx = dx; // horizontal velocity
            this.dy = dy; // vertical velocity
            this.color = color;
            this.mass = this.radius * 0.1; // Simple mass based on radius
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update() {
            // Apply gravity
            this.dy += parseFloat(gravityInput.value);

            // Move
            this.x += this.dx;
            this.y += this.dy;

            const bounce = parseFloat(bounceFactorInput.value);

            // Collision with walls
            // Right wall
            if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.dx *= -bounce;
            }
            // Left wall
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.dx *= -bounce;
            }
            // Bottom wall
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.dy *= -bounce;
                // Apply some friction on ground bounce
                this.dx *= 0.98; 
            }
            // Top wall
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.dy *= -bounce;
            }
        }
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 200 + 55); // Brighter colors
        const g = Math.floor(Math.random() * 200 + 55);
        const b = Math.floor(Math.random() * 200 + 55);
        return `rgb(${r},${g},${b})`;
    }

    function initSimulation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        bubbles = [];
        const numBubbles = parseInt(numBubblesInput.value);
        const maxSpeed = parseFloat(maxSpeedInput.value);
        const maxSize = parseFloat(maxSizeInput.value);
        const minSize = 5; // Minimum bubble size

        for (let i = 0; i < numBubbles; i++) {
            const radius = Math.random() * (maxSize - minSize) + minSize;
            // Ensure bubbles don't spawn inside walls
            const x = Math.random() * (canvas.width - 2 * radius) + radius;
            const y = Math.random() * (canvas.height - 2 * radius) + radius;
            // Random direction and speed
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 0.5; // Add a minimum speed
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const color = getRandomColor();
            bubbles.push(new Bubble(x, y, radius, dx, dy, color));
        }
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // Update display values and re-initialize if necessary
    function setupEventListeners() {
        const inputsToReset = [numBubblesInput, maxSpeedInput, maxSizeInput];
        inputsToReset.forEach(input => {
            input.addEventListener('input', () => {
                updateDisplayValues();
                initSimulation();
            });
        });

        // These inputs can change live without full reset
        const liveUpdateInputs = [gravityInput, bounceFactorInput];
        liveUpdateInputs.forEach(input => {
            input.addEventListener('input', updateDisplayValues);
        });

        resetButton.addEventListener('click', initSimulation);
    }
    
    function updateDisplayValues() {
        numBubblesValueSpan.textContent = numBubblesInput.value;
        maxSpeedValueSpan.textContent = parseFloat(maxSpeedInput.value).toFixed(1);
        maxSizeValueSpan.textContent = maxSizeInput.value;
        gravityValueSpan.textContent = parseFloat(gravityInput.value).toFixed(2);
        bounceFactorValueSpan.textContent = parseFloat(bounceFactorInput.value).toFixed(2);
    }

    // Initial setup
    resizeCanvas(); // Set initial canvas size and start simulation
    updateDisplayValues();
    setupEventListeners();
});
