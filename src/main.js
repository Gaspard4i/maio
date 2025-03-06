const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
let radius = 30;
let x = canvas.width / 2;
let y = canvas.height / 2;
let vx = 0;
let vy = 0;

const canvasResizeObserver = new ResizeObserver(() => resampleCanvas());
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	draw();
	requestAnimationFrame(render);
}

function draw() {
	context.moveTo(0, 0);
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	draw();
	requestAnimationFrame(render);
}

function movePlayer() {
	x += vx;
	y += vy;

	if (x + radius > canvas.width || x < 0) {
		vx = 0;
	}
	if (y + radius > canvas.height || y < 0) {
		vy = 0;
	}
}

setInterval(movePlayer, 1000 / 60);

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

const tache1 = new Image();
tache1.src = '/image/stain.png';
tache1.addEventListener('load', event => {
	context.drawImage(tache1, 200, 200, 40, 40);
	console.log('loaded');
});
