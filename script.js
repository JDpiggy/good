document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const simulationWrapper = document.querySelector('.simulation-wrapper'); // Get the wrapper

    // Control elements
    const shapeTypeInput = document.getElementById('shapeType');
    const numShapesInput = document.getElementById('numShapes');
    const maxSpeedInput = document.getElementById('maxSpeed');
    const maxSizeInput = document.getElementById('maxSize');
    const gravityInput = document.getElementById('gravity');
    const bounceFactorInput = document.getElementById('bounceFactor');
    const maxSpinInput = document.getElementById('maxSpin');
    const resetButton = document.getElementById('resetButton');
    const fullscreenButton = document.getElementById('fullscreenButton'); // New button

    // Value display spans
    const numShapesValueSpan = document.getElementById('numShapesValue');
    const maxSpeedValueSpan = document.getElementById('maxSpeedValue');
    const maxSizeValueSpan = document.getElementById('maxSizeValue');
    const gravityValueSpan = document.getElementById('gravityValue');
    const bounceFactorValueSpan = document.getElementById('bounceFactorValue');
    const maxSpinValueSpan = document.getElementById('maxSpinValue');

    let shapes = [];
    let animationFrameId;

    function setCanvasDimensions() {
        const simArea = document.querySelector('.simulation-area'); // Use simulation-area for sizing
        
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            const controlsContainer = document.querySelector('.controls-container');
            let availableWidth = window.innerWidth;
            let availableHeight = window.innerHeight;
            const padding = 20; // Padding inside simulation-area

            if (window.innerWidth > 768) { // Controls are on the side
                availableWidth -= controlsContainer.offsetWidth;
                canvas.width = Math.min(availableWidth - (padding * 2) , 1200); // Max width
                canvas.height = Math.min(availableHeight - (padding * 2), 800); // Max height
            } else { // Controls are on bottom (or top if order changed)
                availableHeight -= controlsContainer.offsetHeight;
                canvas.width = Math.min(availableWidth - (padding * 2), 1200);
                canvas.height = Math.min(availableHeight - (padding * 2), 700);
            }

            // Ensure canvas fits within its simulation-area container if it's smaller
            canvas.width = Math.min(canvas.width, simArea.clientWidth - (simArea.style.padding ? parseInt(simArea.style.padding) * 2 : 0));
            canvas.height = Math.min(canvas.height, simArea.clientHeight - (simArea.style.padding ? parseInt(simArea.style.padding) * 2 : 0));


             // Fallback if calculated dimensions are too small
            if (canvas.width < 100) canvas.width = simArea.clientWidth > 100 ? simArea.clientWidth - (padding*2) : 300;
            if (canvas.height < 100) canvas.height = simArea.clientHeight > 100 ? simArea.clientHeight - (padding*2) : 200;
        }
    }


    function resizeCanvasAndReinit() {
        setCanvasDimensions();
        initSimulation(); // Re-initialize on resize
    }

    function resizeCanvasOnly() {
        setCanvasDimensions();
        // No re-initialization, shapes continue in new space
        // This is useful for fullscreen toggle
    }

    window.addEventListener('resize', resizeCanvasAndReinit);

    class Shape {
        constructor(x, y, size, dx, dy, color, shapeType, angularVelocity) {
            this.x = x;
            this.y = y;
            this.size = size; // General size parameter
            this.dx = dx;
            this.dy = dy;
            this.color = color;
            this.shapeType = shapeType;
            this.angle = Math.random() * Math.PI * 2;
            this.angularVelocity = angularVelocity;
            
            if (this.shapeType === 'rectangle') {
                const aspect = Math.random() * 0.8 + 0.4; 
                if (Math.random() < 0.5) { 
                    this.width = this.size;
                    this.height = this.size * aspect;
                } else {
                    this.width = this.size * aspect;
                    this.height = this.size;
                }
            } else { 
                this.width = this.size;
                this.height = this.size;
            }
            this.mass = (this.width * this.height) * 0.005;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'; 
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
        
        drawF35() {
            const s = this.size / 20; 
            ctx.beginPath();
            ctx.moveTo(0 * s, -10 * s); 
            ctx.lineTo(2 * s, -3 * s); ctx.lineTo(1.5 * s, 2 * s);
            ctx.lineTo(5 * s, 5 * s);   ctx.lineTo(7 * s, 4 * s);  
            ctx.lineTo(3 * s, 2.5 * s); ctx.lineTo(3.5 * s, 7 * s); 
            ctx.lineTo(2.5 * s, 8 * s); ctx.lineTo(1.5 * s, 6 * s);
            ctx.lineTo(0 * s, 7 * s);  
            ctx.lineTo(-1.5 * s, 6 * s); ctx.lineTo(-2.5 * s, 8 * s);
            ctx.lineTo(-3.5 * s, 7 * s); ctx.lineTo(-3 * s, 2.5 * s);
            ctx.lineTo(-7 * s, 4 * s); ctx.lineTo(-5 * s, 5 * s);
            ctx.lineTo(-1.5 * s, 2 * s); ctx.lineTo(-2 * s, -3 * s);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }

        drawPig() {
            const s = this.size / 20; 
            ctx.beginPath();
            ctx.ellipse(0, 0, 7*s, 5*s, 0, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath(); 
            ctx.ellipse(-6*s, 0, 2.5*s, 2*s, -0.2, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath(); 
            ctx.moveTo(1*s, -4*s); ctx.quadraticCurveTo(3*s, -7*s, 5*s, -5*s);
            ctx.fill(); ctx.stroke();

            ctx.beginPath(); 
            ctx.moveTo(0*s, -4.5*s); ctx.quadraticCurveTo(1.5*s, -7.5*s, 3.5*s, -5.5*s);
            ctx.fill(); ctx.stroke();
            
            ctx.fillRect(-3*s, 4*s, 1.5*s, 3*s); 
            ctx.fillRect(1*s, 4*s, 1.5*s, 3*s);  
        }

        update() {
            this.dy += parseFloat(gravityInput.value);
            this.x += this.dx;
            this.y += this.dy;
            this.angle += this.angularVelocity;

            const bounce = parseFloat(bounceFactorInput.value);
            const effectiveRadius = Math.max(this.width, this.height) / 2;

            if (this.x + effectiveRadius > canvas.width) {
                this.x = canvas.width - effectiveRadius; this.dx *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dx)/ (parseFloat(maxSpeedInput.value) + 0.1) );
            }
            if (this.x - effectiveRadius < 0) {
                this.x = effectiveRadius; this.dx *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dx)/ (parseFloat(maxSpeedInput.value) + 0.1));
            }
            if (this.y + effectiveRadius > canvas.height) {
                this.y = canvas.height - effectiveRadius; this.dy *= -bounce;
                this.dx *= 0.98; this.angularVelocity *= 0.95; 
                if (Math.abs(this.dy) < parseFloat(gravityInput.value) * 2 && parseFloat(gravityInput.value) > 0) this.dy = 0; // Settle better
            }
            if (this.y - effectiveRadius < 0) {
                this.y = effectiveRadius; this.dy *= -bounce;
                this.angularVelocity += (Math.random() - 0.5) * 0.05 * (Math.abs(this.dy)/ (parseFloat(maxSpeedInput.value) + 0.1));
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
        const numShapesVal = parseInt(numShapesInput.value);
        const maxSpeedVal = parseFloat(maxSpeedInput.value);
        const SmaxSizeVal = parseFloat(maxSizeInput.value);
        const minSize = SmaxSizeVal * 0.3 < 10 ? SmaxSizeVal * 0.3 : 10;
        const currentShapeType = shapeTypeInput.value;
        const currentMaxSpin = parseFloat(maxSpinInput.value);

        for (let i = 0; i < numShapesVal; i++) {
            const size = Math.random() * (SmaxSizeVal - minSize) + minSize;
            const spawnMargin = size / 1.8; 

            let x = Math.random() * (canvas.width - 2 * spawnMargin) + spawnMargin;
            let y = Math.random() * (canvas.height - 2 * spawnMargin) + spawnMargin;
            // Ensure spawn is within bounds, even if canvas is tiny
            x = Math.max(spawnMargin, Math.min(x, canvas.width - spawnMargin));
            y = Math.max(spawnMargin, Math.min(y, canvas.height - spawnMargin));


            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeedVal + 0.2;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const color = getRandomColor();
            const angularVelocity = (Math.random() - 0.5) * 2 * currentMaxSpin;

            shapes.push(new Shape(x, y, size, dx, dy, color, currentShapeType, angularVelocity));
        }
        // Ensure animation starts/restarts
        if (animationFrameId) cancelAnimationFrame(animationFrameId); // Clear previous frame
        animate();
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
                setCanvasDimensions(); // Ensure canvas dimensions are updated before init
                initSimulation(); 
            });
        });

        const liveUpdateInputs = [gravityInput, bounceFactorInput];
        liveUpdateInputs.forEach(input => {
            input.addEventListener('input', updateDisplayValues);
        });

        resetButton.addEventListener('click', () => {
            updateDisplayValues(); 
            setCanvasDimensions(); // Ensure canvas dimensions are updated before init
            initSimulation();
        });

        fullscreenButton.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    
    function updateDisplayValues() {
        numShapesValueSpan.textContent = numShapesInput.value;
        maxSpeedValueSpan.textContent = parseFloat(maxSpeedInput.value).toFixed(1);
        maxSizeValueSpan.textContent = maxSizeInput.value;
        gravityValueSpan.textContent = parseFloat(gravityInput.value).toFixed(2);
        bounceFactorValueSpan.textContent = parseFloat(bounceFactorInput.value).toFixed(2);
        maxSpinValueSpan.textContent = parseFloat(maxSpinInput.value).toFixed(3);
    }

    function toggleFullScreen() {
        const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

        if (!fsElement) {
            // Go fullscreen on the simulationWrapper for better control
            if (simulationWrapper.requestFullscreen) {
                simulationWrapper.requestFullscreen();
            } else if (simulationWrapper.webkitRequestFullscreen) { /* Safari */
                simulationWrapper.webkitRequestFullscreen();
            } else if (simulationWrapper.mozRequestFullScreen) { /* Firefox */
                simulationWrapper.mozRequestFullScreen();
            } else if (simulationWrapper.msRequestFullscreen) { /* IE/Edge */
                simulationWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }

    function handleFullscreenChange() {
        const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (fsElement) {
            document.body.classList.add('fullscreen-active');
            fullscreenButton.textContent = "Exit Fullscreen";
        } else {
            document.body.classList.remove('fullscreen-active');
            fullscreenButton.textContent = "Toggle Fullscreen";
        }
        // Resize canvas without re-initializing shapes
        // A short delay can help ensure the DOM has updated for new dimensions
        setTimeout(() => {
            resizeCanvasOnly(); 
            // We might need to adjust shape positions if they are outside the new bounds
            // For now, let's see how it behaves.
            // A more robust solution might iterate shapes and clamp them to new bounds.
        }, 50); 
    }


    // Initial setup
    updateDisplayValues();
    resizeCanvasAndReinit(); // Set initial canvas size and start simulation
    setupEventListeners();
});
