import { context } from './canvas.js';

export const IMAGE_SIZE = 40;
export const position = [
	[200, 200],
	[600, 600],
	[246, 478],
	[234, 646],
	[987, 789],
];

const tache1 = new Image();
tache1.src = 'src/assets/stain.png';

export function loadImg() {
	position.forEach(element => {
		context.drawImage(tache1, element[0], element[1], IMAGE_SIZE, IMAGE_SIZE);
	});
}

tache1.addEventListener('load', () => {
	loadImg();
	console.log('loaded');
});
