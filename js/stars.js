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

// Create STATIC mountain range with TRIANGULAR peaks
let mountainCanvas;

function createMountainCanvas() {
    mountainCanvas = document.createElement('canvas');
    mountainCanvas.width = canvas.width;
    mountainCanvas.height = canvas.height;
    const mCtx = mountainCanvas.getContext('2d');
    
    // Draw triangular mountain peaks with slightly rounded tops
    function drawTriangularMountains(numPeaks, baseY, minHeight, maxHeight, color) {
        mCtx.beginPath();
        mCtx.moveTo(0, mountainCanvas.height);
        mCtx.lineTo(0, baseY);
        
        const peakSpacing = mountainCanvas.width / numPeaks;
        
        for (let i = 0; i < numPeaks; i++) {
            // Calculate peak position
            const peakX = (i + 0.5) * peakSpacing;
            const peakHeight = minHeight + Math.random() * (maxHeight - minHeight);
            const peakY = baseY - peakHeight;
            
            // Left side of mountain (going up)
            const leftBaseX = i * peakSpacing;
            const leftBaseY = baseY;
            
            // Right side of mountain (going down)
            const rightBaseX = (i + 1) * peakSpacing;
            const rightBaseY = baseY;
            
            // Draw left slope with slight curve near peak
            const leftControlX = peakX - peakSpacing * 0.15;
            const leftControlY = peakY + 20;
            
            mCtx.lineTo(leftBaseX, leftBaseY);
            mCtx.lineTo(leftControlX, leftControlY);
            
            // Rounded peak top
            const roundness = 15;
            mCtx.arcTo(peakX, peakY, peakX + roundness, peakY + roundness, roundness);
            
            // Draw right slope
            const rightControlX = peakX + peakSpacing * 0.15;
            const rightControlY = peakY + 20;
            
            mCtx.lineTo(rightControlX, rightControlY);
            mCtx.lineTo(rightBaseX, rightBaseY);
        }
        
        // Close the path
        mCtx.lineTo(mountainCanvas.width, baseY);
        mCtx.lineTo(mountainCanvas.width, mountainCanvas.height);
        mCtx.closePath();
        
        mCtx.fillStyle = color;
        mCtx.fill();
    }
    
    // Draw three layers of triangular mountains (back to front)
    drawTriangularMountains(3, canvas.height * 0.70, canvas.height * 0.15, canvas.height * 0.25, '#384551');
    drawTriangularMountains(4, canvas.height * 0.75, canvas.height * 0.20, canvas.height * 0.35, '#2B3843');
    drawTriangularMountains(5, canvas.height * 0.80, canvas.height * 0.25, canvas.height * 0.45, '#26333E');
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