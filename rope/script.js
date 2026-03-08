const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

const DEFAULT_CONFIG = {
    ropeLength: 40,
    segmentLength: 12,
    gravity: 0.6,
    friction: 0.96,
    stiffness: 5,
    circleRadius: 20,
    ropeColor: '#e2e8f0',
    anchorColor: '#38bdf8',
    mouseColor: '#f472b6'
};

let CONFIG = { ...DEFAULT_CONFIG };

let points = [];
let sticks = [];
let mouse = { x: 0, y: 0 };
let anchor = { x: 0, y: 0 };

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = pinned;
    }

    update() {
        if (this.pinned) return;

        const vx = (this.x - this.oldx) * CONFIG.friction;
        const vy = (this.y - this.oldy) * CONFIG.friction;

        this.oldx = this.x;
        this.oldy = this.y;

        this.x += vx;
        this.y += vy;
        this.y += CONFIG.gravity;
    }
}

class Stick {
    constructor(p1, p2, length) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length;
    }

    update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

        const diff = (this.length - dist) / dist;

        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;

        if (!this.p1.pinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }
}

function initRope() {
    points = [];
    sticks = [];

    const startX = anchor.x;
    const startY = anchor.y;

    for (let i = 0; i < CONFIG.ropeLength; i++) {
        const pinned = (i === 0);
        const p = new Point(startX, startY - (i * CONFIG.segmentLength), pinned);
        points.push(p);

        if (i > 0) {
            sticks.push(new Stick(points[i-1], p, CONFIG.segmentLength));
        }
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    anchor.x = width / 2;
    anchor.y = height - 100;
}

function updateMouse(e) {
    const panel = document.querySelector('.control-panel');
    const rect = panel.getBoundingClientRect();
    
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        return;
    }
    
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', updateMouse);
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

// UI Elements
const gravitySlider = document.getElementById('gravity');
const frictionSlider = document.getElementById('friction');
const segLenSlider = document.getElementById('segLen');
const ropeLenSlider = document.getElementById('ropeLen');
const stiffnessSlider = document.getElementById('stiffness');

const gravityVal = document.getElementById('gravityVal');
const frictionVal = document.getElementById('frictionVal');
const segLenVal = document.getElementById('segLenVal');
const ropeLenVal = document.getElementById('ropeLenVal');
const stiffnessVal = document.getElementById('stiffnessVal');

gravitySlider.addEventListener('input', (e) => {
    CONFIG.gravity = parseFloat(e.target.value);
    gravityVal.textContent = CONFIG.gravity;
});

frictionSlider.addEventListener('input', (e) => {
    CONFIG.friction = parseFloat(e.target.value);
    frictionVal.textContent = CONFIG.friction;
});

segLenSlider.addEventListener('input', (e) => {
    CONFIG.segmentLength = parseInt(e.target.value);
    segLenVal.textContent = CONFIG.segmentLength;
    initRope();
});

ropeLenSlider.addEventListener('input', (e) => {
    CONFIG.ropeLength = parseInt(e.target.value);
    ropeLenVal.textContent = CONFIG.ropeLength;
    initRope();
});

stiffnessSlider.addEventListener('input', (e) => {
    CONFIG.stiffness = parseInt(e.target.value);
    stiffnessVal.textContent = CONFIG.stiffness;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    CONFIG = { ...DEFAULT_CONFIG };
    gravitySlider.value = CONFIG.gravity;
    frictionSlider.value = CONFIG.friction;
    segLenSlider.value = CONFIG.segmentLength;
    ropeLenSlider.value = CONFIG.ropeLength;
    stiffnessSlider.value = CONFIG.stiffness;

    gravityVal.textContent = CONFIG.gravity;
    frictionVal.textContent = CONFIG.friction;
    segLenVal.textContent = CONFIG.segmentLength;
    ropeLenVal.textContent = CONFIG.ropeLength;
    stiffnessVal.textContent = CONFIG.stiffness;

    initRope();
});

document.getElementById('windBtn').addEventListener('click', () => {
    points.forEach((p) => {
        if (!p.pinned) {
            p.oldx -= (Math.random() * 20 + 10);
        }
    });
});

document.getElementById('explodeBtn').addEventListener('click', () => {
    points.forEach((p) => {
        if (!p.pinned) {
            p.oldx += (Math.random() - 0.5) * 100;
            p.oldy += (Math.random() - 0.5) * 100;
        }
    });
});

function update() {
    for (let i = 0; i < points.length; i++) {
        let p = points[i];

        if (i === points.length - 1) {
            p.x = mouse.x;
            p.y = mouse.y;
        } else {
            p.update();
        }
    }

    for (let k = 0; k < CONFIG.stiffness; k++) {
        for (let stick of sticks) {
            stick.update();
        }
    }
}

function draw() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);

    ctx.strokeStyle = CONFIG.ropeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    drawCircle(anchor.x, anchor.y, CONFIG.circleRadius, CONFIG.anchorColor);
    drawCircle(mouse.x, mouse.y, CONFIG.circleRadius, CONFIG.mouseColor);
}

function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x - r*0.3, y - r*0.3, r/3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

// Initialize
resize();
mouse.x = width / 2;
mouse.y = height / 3;
initRope();
animate();
