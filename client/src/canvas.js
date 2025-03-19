export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

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
