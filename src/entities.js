import { Stain } from './stain.js';
import { canvas } from './canvas.js';

export const stains = [];
for (let i = 0; i < 20; i++) {
	const x = Math.floor(Math.random() * canvas.clientWidth-10);
	const y = Math.floor(Math.random() * canvas.clientHeight-10);
	stains.push(new Stain(20, x, y, 0, 0));
}
