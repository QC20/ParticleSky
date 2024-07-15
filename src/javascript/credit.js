const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let isExploding = false;
let explosionStartTime = 0;
const redirectURL = 'https://jonaskjeldmand.vercel.app/';
const explosionDuration = 1500; // 1.5 seconds
const fadeOutDuration = 500; // 0.5 seconds

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 1.25;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 10) + 1;
        this.velocity = { x: 0, y: 0 };
        this.alpha = 1;
        this.noise = {
            x: Math.random() * 0.5 - 0.25,
            y: Math.random() * 0.5 - 0.25
        };
        this.noiseOffset = Math.random() * 1000;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(mouseX, mouseY, isHoveringText, currentTime) {
        if (isExploding) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            const elapsedTime = currentTime - explosionStartTime;
            if (elapsedTime > explosionDuration - fadeOutDuration) {
                this.alpha = 1 - (elapsedTime - (explosionDuration - fadeOutDuration)) / fadeOutDuration;
            }
            return;
        }

        if (isHoveringText) {
            const force = 0.1; // Small force applied to all particles
            const angle = Math.atan2(mouseY - this.y, mouseX - this.x);
            
            // Add noise to the movement
            const noiseX = Math.sin(currentTime * 0.002 + this.noiseOffset) * this.noise.x;
            const noiseY = Math.cos(currentTime * 0.002 + this.noiseOffset) * this.noise.y;
            
            this.velocity.x += Math.cos(angle) * force * 0.1 + noiseX; // 15% slower than original force 0.2
            this.velocity.y += Math.sin(angle) * force * 0.1 + noiseY;
            
            // Apply velocity with stronger damping
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.9;
        } else {
            // Return to original position with easing
            const returnForce = 0.05;
            this.velocity.x += (this.baseX - this.x) * returnForce;
            this.velocity.y += (this.baseY - this.y) * returnForce;
            
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.9;
        }
    }

    explode() {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
    }
}

function init() {
    particles = [];
    // Change font to bold or increase size to fit with your name
    ctx.font = '500 28px "Poppins", Arial, sans-serif';
    ctx.fillStyle = 'white';
    
    const text = 'Jonas Kjeldmand Jensen';
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    const x = canvas.width - textWidth - 20;
    const y = canvas.height - 20;
    
    ctx.fillText(text, x, y);
    
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < data.height; y += 3) { // Increased step to 3
        for (let x = 0; x < data.width; x += 3) { // Increased step to 3
            if (data.data[(y * 4 * data.width) + (x * 4) + 3] > 200) { // Increased threshold to 200
                particles.push(new Particle(x, y));
            }
        }
    }
}

let mouse = {
    x: null,
    y: null
}
let isHoveringText = false;

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    const textBounds = getTextBounds();
    isHoveringText = event.x >= textBounds.x && event.x <= textBounds.x + textBounds.width &&
                     event.y >= textBounds.y - textBounds.height && event.y <= textBounds.y;
});

canvas.addEventListener('click', function(event) {
    const textBounds = getTextBounds();
    if (event.x >= textBounds.x && event.x <= textBounds.x + textBounds.width &&
        event.y >= textBounds.y - textBounds.height && event.y <= textBounds.y) {
        startExplosion();
    }
});

function getTextBounds() {
    const text = 'Jonas Kjeldmand Jensen';
    const metrics = ctx.measureText(text);
    return {
        x: canvas.width - metrics.width - 20,
        y: canvas.height - 20,
        width: metrics.width,
        height: 35 // Approximate height based on font size
    };
}

function startExplosion() {
    isExploding = true;
    explosionStartTime = Date.now();
    particles.forEach(particle => particle.explode());
    setTimeout(() => {
        window.location.href = redirectURL;
    }, explosionDuration);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentTime = Date.now();
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse.x, mouse.y, isHoveringText, currentTime);
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});
