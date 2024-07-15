// Get the canvas and context
var c = document.getElementById("textCanvas");
var ctx = c.getContext("2d");
var mask;

// Configuration variables
var pointCount = 600;
var str = "colonoscopy";
var fontStr = "bold 60pt Helvetica Neue, Helvetica, Arial, sans-serif";

// Set canvas dimensions based on text size
ctx.font = fontStr;
ctx.textAlign = "center";
c.width = ctx.measureText(str).width;
c.height = 128; // Set to font size

// Arrays to store white pixels and points
var whitePixels = [];
var points = [];

// Point constructor and update method
var Point = function(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx || 1;
    this.vy = vy || 1;
};

Point.prototype.update = function() {
    // Draw the point
    ctx.beginPath();
    ctx.fillStyle = "#95a5a6";
    ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    // Change direction if hitting a black pixel or edge of the canvas
    if (this.x + this.vx >= c.width || this.x + this.vx < 0 || mask.data[coordsToI(this.x + this.vx, this.y, mask.width)] != 255) {
        this.vx *= -1;
        this.x += this.vx * 2;
    }
    if (this.y + this.vy >= c.height || this.y + this.vy < 0 || mask.data[coordsToI(this.x, this.y + this.vy, mask.width)] != 255) {
        this.vy *= -1;
        this.y += this.vy * 2;
    }

    // Draw lines between close points
    for (var k = 0, m = points.length; k < m; k++) {
        if (points[k] === this) continue;

        var d = Math.sqrt(Math.pow(this.x - points[k].x, 2) + Math.pow(this.y - points[k].y, 2));
        if (d < 5) {
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(points[k].x, points[k].y);
            ctx.stroke();
        }
        if (d < 20) {
            ctx.lineWidth = 0.1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(points[k].x, points[k].y);
            ctx.stroke();
        }
    }

    // Update point position
    this.x += this.vx;
    this.y += this.vy;
};

// Main loop to update and draw points
function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var k = 0, m = points.length; k < m; k++) {
        points[k].update();
    }
}

// Initialize the canvas and points
function init() {
    // Draw the text to create a mask
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.rect(0, 0, c.width, c.height);
    ctx.fill();
    ctx.font = fontStr;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.fillText(str, 0, c.height / 2 + (c.height / 2));
    ctx.closePath();

    // Save the mask
    mask = ctx.getImageData(0, 0, c.width, c.height);

    // Clear the canvas
    ctx.clearRect(0, 0, c.width, c.height);

    // Save all white pixels in an array
    for (var i = 0; i < mask.data.length; i += 4) {
        if (mask.data[i] == 255 && mask.data[i + 1] == 255 && mask.data[i + 2] == 255 && mask.data[i + 3] == 255) {
            whitePixels.push([iToX(i, mask.width), iToY(i, mask.width)]);
        }
    }

    // Add points to the canvas
    for (var k = 0; k < pointCount; k++) {
        addPoint();
    }
}

// Add a new point to a random white pixel location
function addPoint() {
    var spawn = whitePixels[Math.floor(Math.random() * whitePixels.length)];
    var p = new Point(spawn[0], spawn[1], Math.floor(Math.random() * 2 - 1), Math.floor(Math.random() * 2 - 1));
    points.push(p);
}

// Utility functions to convert between coordinates and array indices
function iToX(i, w) {
    return ((i % (4 * w)) / 4);
}

function iToY(i, w) {
    return (Math.floor(i / (4 * w)));
}

function coordsToI(x, y, w) {
    return ((w * y) + x) * 4;
}

// Start the loop and initialize
setInterval(loop, 50);
init();
    