import { camera } from './camera.js';

export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

export const maxWidth = 10000;
export const maxHeight = 10000;

export function resampleCanvas(draw, render) {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	draw();
	requestAnimationFrame(render);
}

export function observeCanvas(draw, render) {
	const canvasResizeObserver = new ResizeObserver(() =>
		resampleCanvas(draw, render)
	);
	canvasResizeObserver.observe(canvas);
}
