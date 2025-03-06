const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
let isDrawing = false;
let x = 0;
let y = 0;
let vx = 0;
let vy = 0;
let drawing = [];
let currentPath = [];
let lineWidth = 5;
let strokeStyle = '#000000';
let fillColor = '#FFFF00';
let scrollSpeed = 1; // Speed of scrolling

const canvasResizeObserver = new ResizeObserver(() => resampleCanvas());
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

canvas.addEventListener('mousedown', event => {
	isDrawing = true;
	currentPath = [
		{
			x: event.clientX - canvas.offsetLeft,
			y: event.clientY - canvas.offsetTop,
		},
	];
	drawing.push(currentPath);
	context.beginPath();
	context.moveTo(
		event.clientX - canvas.offsetLeft,
		event.clientY - canvas.offsetTop
	);
	context.lineWidth = lineWidth;
	context.strokeStyle = strokeStyle;
	context.fillStyle = fillColor;
});

canvas.addEventListener('mouseup', () => {
	isDrawing = false;
});

canvas.addEventListener('mousemove', event => {
	if (isDrawing) {
		const point = {
			x: event.clientX - canvas.offsetLeft,
			y: event.clientY - canvas.offsetTop,
		};
		currentPath.push(point);
		context.lineTo(point.x, point.y);
		context.stroke();
	}
});

const image = new Image();
image.src = '/images/monster.png';
image.addEventListener('load', () => {
	requestAnimationFrame(render);
});

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	redrawDrawing();
	context.drawImage(image, x, y);
	requestAnimationFrame(render);
}

function redrawDrawing() {
	context.beginPath();
	for (let path of drawing) {
		if (path.length > 0) {
			context.moveTo(path[0].x - scrollSpeed, path[0].y);
			for (let point of path) {
				point.x += scrollSpeed; // Move each point to the left
				context.lineTo(point.x, point.y);
			}
			context.closePath();
			context.fill(); // Fill the shape with the fill color
		}
	}
	context.lineWidth = lineWidth;
	context.strokeStyle = strokeStyle;
	context.stroke();
}

function resetMonster() {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
}

function checkCollision() {
    // Coordonnées des quatre coins de l'image du monstre
    const monsterCorners = [
        { x: x, y: y }, // Coin supérieur gauche
        { x: x + image.width, y: y }, // Coin supérieur droit
        { x: x, y: y + image.height }, // Coin inférieur gauche
        { x: x + image.width, y: y + image.height }, // Coin inférieur droit
    ];

    for (let path of drawing) {
        let isOverlapping = true;

        // Vérifier si tous les coins du monstre sont à l'intérieur du chemin
        for (let corner of monsterCorners) {
            if (!isPointInPolygon(corner, path)) {
                isOverlapping = false;
                break;
            }
        }

        // Si tous les coins sont à l'intérieur du chemin, réinitialiser le monstre
        if (isOverlapping) {
            resetMonster();
            return;
        }
    }
}

// Algorithme du "ray casting" pour vérifier si un point est dans un polygone
function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) != (yj > point.y)) &&
            (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function moveMonster() {
	x += vx;
	y += vy;

	// Vérifier les rebonds sur les bordures du canvas
	if (x + image.width > canvas.width || x < 0) {
		vx = -vx; // Inverser la direction en x
	}
	if (y + image.height > canvas.height || y < 0) {
		vy = -vy; // Inverser la direction en y
	}
	checkCollision();
}

setInterval(moveMonster, 1000 / 60);

document.addEventListener('keydown', event => {
	switch (event.key) {
		case 'ArrowRight':
			vx = 15;
			break;
		case 'ArrowLeft':
			vx = -15;
			break;
		case 'ArrowUp':
			vy = -15;
			break;
		case 'ArrowDown':
			vy = 15;
			break;
	}
});

document.addEventListener('keyup', event => {
	switch (event.key) {
		case 'ArrowRight':
		case 'ArrowLeft':
			vx = 0;
			break;
		case 'ArrowUp':
		case 'ArrowDown':
			vy = 0;
			break;
	}
});
