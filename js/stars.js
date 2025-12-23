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

// NEW: Create smooth, rounded mountains
function createSmoothMountainRange(numPeaks, baseHeight, color) {
    // Generate mountain peak points
    const points = [];
    const segmentWidth = canvas.width / numPeaks;
    
    for (let i = 0; i <= numPeaks; i++) {
        const x = i * segmentWidth;
        const heightVariation = Math.sin(i * 0.5) * (baseHeight * 0.3) + Math.random() * (baseHeight * 0.15);
        const y = canvas.height - baseHeight - heightVariation;
        points.push({ x, y });
    }
    
    // Draw smooth curve through points
    c.beginPath();
    c.moveTo(0, canvas.height);
    
    // Start from first point
    c.lineTo(points[0].x, points[0].y);
    
    // Draw smooth curves between peaks using quadratic curves
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        
        // Control point for smooth curve
        const cpX = (prev.x + curr.x) / 2;
        const cpY = (prev.y + curr.y) / 2;
        
        c.quadraticCurveTo(cpX, cpY, curr.x, curr.y);
    }
    
    // Close the path
    c.lineTo(canvas.width, canvas.height);
    c.lineTo(0, canvas.height);
    
    c.fillStyle = color;
    c.fill();
    c.closePath();
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
}

// Animation Loop
function animate() {
    c.clearRect(0, 0, 0, canvas.height)
    c.fillStyle = backgroundGradient
    c.fillRect(0, 0, canvas.width, canvas.height)

    backgroundStars.forEach(backgroundStar => {
        backgroundStar.draw()
    })

    // Draw smooth mountains with rounded peaks
    if(flag) createSmoothMountainRange(4, canvas.height * 0.7, '#384551')
    if(flag) createSmoothMountainRange(5, canvas.height * 0.6, '#2B3843')
    if(flag) createSmoothMountainRange(6, canvas.height * 0.4, '#26333E')
    
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