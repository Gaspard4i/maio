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

// Méthode pour dessiner un joueur
export function drawPlayer(context, player) {
	context.fillStyle = 'rgba(255, 255, 255)';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();

	if (!player.useKeyboard) {
		context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		context.lineWidth = 2;
		const maxDistance = Math.min(canvas.width, canvas.height) / 4;
		context.beginPath();
		context.arc(player.x, player.y, maxDistance, 0, 2 * Math.PI);
		context.stroke();
	}
}

// Méthode pour dessiner une tache
export function drawStain(context, stain) {
	const image = new Image();
	image.src = '../images/stain.png';
	context.drawImage(
		image,
		stain.x - stain.radius,
		stain.y - stain.radius,
		stain.radius * 2,
		stain.radius * 2
	);
}

// Méthode pour dessiner un bonus
export function drawBonus(context, bonus) {
	const image = new Image();
	image.src =
		bonus.type === 'VITESSE'
			? 'src/assets/stain_green.png'
			: 'src/assets/stain_blue.png';
	context.drawImage(
		image,
		bonus.x - bonus.radius,
		bonus.y - bonus.radius,
		bonus.radius * 2,
		bonus.radius * 2
	);
}

// Méthode principale pour dessiner le jeu
export function drawGame(context, player, otherPlayers, stains, camera) {
	context.save();
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	context.translate(centerX, centerY);
	context.scale(camera.zoom, camera.zoom);
	context.translate(-camera.x, -camera.y);

	// Dessine le joueur local
	drawPlayer(context, player);

	// Dessine les autres joueurs
	for (const id in otherPlayers) {
		drawPlayer(context, otherPlayers[id]);
	}

	// Dessine les entités (taches et bonus)
	stains.forEach(entity => {
		if (entity.type === 'VITESSE' || entity.type === 'TAILLE') {
			drawBonus(context, entity);
		} else {
			drawStain(context, entity);
		}
	});

	context.restore();
}

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};
