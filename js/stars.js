const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;     
    init()
});

// Objects
function Star(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: 3
    }
    this.friction = 0.8
    this.gravity = 1
}

Star.prototype.draw = function() {
    c.save()
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.shadowColor = '#E3EAEF'
    c.shadowBlur = 20
    c.fill()
    c.closePath()
    c.restore()
}

Star.prototype.update = function() {
    this.draw()

    if(this.y + this.radius + this.velocity.y > canvas.height - groundHeight){
        this.velocity.y = -this.velocity.y * this.friction
        this.shatter()
    }
    else{
        this.velocity.y += this.gravity
    }

    if(this.x + this.radius + this.velocity.x > canvas.width || this.x - this.radius <= 0){
        this.velocity.x = -this.velocity.x * this.friction
        this.shatter()
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
}

Star.prototype.shatter = function(){
    this.radius -= 3
    for(let i = 0; i < 8; i++){
        miniStars.push(new MiniStar(this.x, this.y, 2))
    }
}

function MiniStar(x, y, radius, color){
    Star.call(this, x, y, radius, color)
    this.velocity = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 30 
    }
    this.friction = 0.8
    this.gravity = 0.1
    this.ttl = 100
    this.opacity = 1
}

MiniStar.prototype.draw = function() {
    c.save()
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = `rgba(227,234, 239, ${this.opacity})`
    c.shadowColor = '#E3EAEF'
    c.shadowBlur = 20
    c.fill()
    c.closePath()
    c.restore()
}

MiniStar.prototype.update = function() {
    this.draw()

    if(this.y + this.radius + this.velocity.y > canvas.height - groundHeight){
        this.velocity.y = -this.velocity.y * this.friction
    }
    else{
        this.velocity.y += this.gravity
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
    this.ttl -= 1
    this.opacity -= 0.0001 * this.ttl
}

// Create STATIC mountain range with distinct peaks
let mountainCanvas;

function createMountainCanvas() {
    mountainCanvas = document.createElement('canvas');
    mountainCanvas.width = canvas.width;
    mountainCanvas.height = canvas.height;
    const mCtx = mountainCanvas.getContext('2d');
    
    // Function to create a mountain range with visible peaks
    function drawMountainRange(numPeaks, baseY, peakHeight, color, roughness) {
        const points = [];
        const spacing = mountainCanvas.width / (numPeaks + 1);
        
        // Create peak points
        for (let i = 0; i <= numPeaks + 1; i++) {
            const x = i * spacing;
            let y;
            
            if (i === 0 || i === numPeaks + 1) {
                // Edge points at base
                y = baseY;
            } else {
                // Create peaks with variation
                const peakVariation = (Math.random() - 0.5) * roughness;
                y = baseY - peakHeight + peakVariation;
            }
            
            points.push({ x, y });
        }
        
        // Draw the mountain range
        mCtx.beginPath();
        mCtx.moveTo(-50, mountainCanvas.height);
        
        // Draw to first point
        mCtx.lineTo(points[0].x, points[0].y);
        
        // Create smooth curves between peaks
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;
            
            // Create valley between peaks
            const valleyDepth = peakHeight * 0.4;
            const controlY = midY + valleyDepth;
            
            mCtx.quadraticCurveTo(midX, controlY, next.x, next.y);
        }
        
        // Close the shape
        mCtx.lineTo(mountainCanvas.width + 50, mountainCanvas.height);
        mCtx.lineTo(-50, mountainCanvas.height);
        mCtx.closePath();
        
        mCtx.fillStyle = color;
        mCtx.fill();
    }
    
    // Draw three layers of mountain ranges (back to front)
    // Back mountains - smaller, lighter
    drawMountainRange(4, canvas.height * 0.75, canvas.height * 0.25, '#384551', 40);
    
    // Middle mountains - medium size
    drawMountainRange(5, canvas.height * 0.80, canvas.height * 0.35, '#2B3843', 50);
    
    // Front mountains - tallest, darkest
    drawMountainRange(6, canvas.height * 0.85, canvas.height * 0.45, '#26333E', 60);
}

// Implementation
const backgroundGradient = c.createLinearGradient(0, 0, canvas.width, canvas.height)
backgroundGradient.addColorStop(0, '#171e26')
backgroundGradient.addColorStop(1, '#3f586b')

let stars
let miniStars
let backgroundStars
let ticker = 0
let randomSpawnRate = 75
const groundHeight = 0.09 * canvas.height
let inf = 1e9

function init() {
    stars = []
    miniStars = []
    backgroundStars = []
   
    for(let i = 0; i < 200; i++){
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 3
        backgroundStars.push(new Star(x, y, radius, 'white'))
    }
    
    // Create static mountains once
    createMountainCanvas();
}

// Animation Loop
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = backgroundGradient
    c.fillRect(0, 0, canvas.width, canvas.height)

    backgroundStars.forEach(backgroundStar => {
        backgroundStar.draw()
    })

    // Draw the pre-rendered mountain image
    if(flag && mountainCanvas) {
        c.drawImage(mountainCanvas, 0, 0);
    }
    
    c.fillStyle = '#182028'
    c.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight)
    
    stars.forEach((star, index) => {
        star.update();
        if(star.radius == 0){
            stars.splice(index, 1)
        }
    });

    miniStars.forEach((miniStar, index) => {
        miniStar.update();
        if(miniStar.ttl == 0){
            miniStars.splice(index, 1)
        }
    });

    ticker++
    if(ticker >= inf){
        ticker = 0
    }
    if(ticker % randomSpawnRate == 0){
        const radius = 9
        const x = Math.max(radius, Math.random() * canvas.width - radius)
        stars.push(new Star(x, -100, 9, '#E3EAEF'))
        randomSpawnRate = Math.floor(Math.random() * (200 - 125 + 1) + 125)
    }

    requestAnimationFrame(animate)
}

init()
animate()