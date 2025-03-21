export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

let debugCameraEnabled = false; // Mode de débogage désactivé par défaut
let debugPlayerEnabled = false;

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};

// ==================== UTILITAIRES ====================

export function setDebugCameraMode(enabled) {
	debugCameraEnabled = enabled;
}
export function setDebugPlayerMode(enabled) {
	debugPlayerEnabled = enabled;
}

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

function isEntityVisible(entity, camera, canvasWidth, canvasHeight) {
	const halfWidth = canvasWidth / 2 / camera.zoom;
	const halfHeight = canvasHeight / 2 / camera.zoom;

	const cameraLeft = camera.x - halfWidth;
	const cameraRight = camera.x + halfWidth;
	const cameraTop = camera.y - halfHeight;
	const cameraBottom = camera.y + halfHeight;

	return (
		entity.x + entity.radius > cameraLeft &&
		entity.x - entity.radius < cameraRight &&
		entity.y + entity.radius > cameraTop &&
		entity.y - entity.radius < cameraBottom
	);
}

function isEntityVisibleInDebug(entity, camera, canvasWidth, canvasHeight) {
	const halfWidth = canvasWidth / 4 / camera.zoom; // Taille réduite pour la caméra de débogage
	const halfHeight = canvasHeight / 4 / camera.zoom;

	const cameraLeft = camera.x - halfWidth;
	const cameraRight = camera.x + halfWidth;
	const cameraTop = camera.y - halfHeight;
	const cameraBottom = camera.y + halfHeight;

	return (
		entity.x + entity.radius > cameraLeft &&
		entity.x - entity.radius < cameraRight &&
		entity.y + entity.radius > cameraTop &&
		entity.y - entity.radius < cameraBottom
	);
}

export function interpolatePlayerPosition(player, deltaTime) {
	player.x += player.vx * deltaTime;
	player.y += player.vy * deltaTime;
}

// ==================== DESSIN ====================

function drawDebugPlayer(context, player) {
	const maxDistance = Math.min(canvas.width, canvas.height) / 4;
	context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	context.lineWidth = 2;
	context.beginPath();
	context.arc(player.x, player.y, maxDistance, 0, 2 * Math.PI);
	context.stroke();
}

export function drawPlayer(context, player) {
	context.fillStyle = 'rgba(255, 255, 255)';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();

	if (debugPlayerEnabled) {
		drawDebugPlayer(context, player); // Appel de la méthode de débogage
	}
}

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

function drawCamera(context, camera, canvasWidth, canvasHeight) {
	if (!debugCameraEnabled) return;

	const halfWidth = canvasWidth / 4 / camera.zoom; // Réduit la largeur à la moitié
	const halfHeight = canvasHeight / 4 / camera.zoom; // Réduit la hauteur à la moitié

	context.save();
	context.strokeStyle = 'yellow';
	context.lineWidth = 2;
	context.strokeRect(
		camera.x - halfWidth,
		camera.y - halfHeight,
		halfWidth * 2,
		halfHeight * 2
	);
	context.restore();
}

// ==================== RENDU PRINCIPAL ====================

export function drawGame(context, player, otherPlayers, stains, bots, camera) {
	context.save();
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	context.translate(centerX, centerY);
	context.scale(camera.zoom, camera.zoom);
	context.translate(-camera.x, -camera.y);

	// Dessine le débogage de la caméra
	drawCamera(context, camera, canvas.width, canvas.height);

	// Dessine le joueur local
	drawPlayer(context, player);

	// Interpolation des autres joueurs
	const deltaTime = 1 / 60; // Temps entre deux frames (60Hz)
	for (const id in otherPlayers) {
		interpolatePlayerPosition(otherPlayers[id], deltaTime);
		drawPlayer(context, otherPlayers[id]);
	}

	// Dessine uniquement les entités visibles
	stains.forEach(entity => {
		const isVisible = debugCameraEnabled
			? isEntityVisibleInDebug(entity, camera, canvas.width, canvas.height)
			: isEntityVisible(entity, camera, canvas.width, canvas.height);

		if (isVisible) {
			if (entity.type === 'VITESSE' || entity.type === 'TAILLE') {
				drawBonus(context, entity);
			} else {
				drawStain(context, entity);
			}
		}
	});

	// Dessine uniquement les entités visibles
	bots.forEach(entity => {
		const isVisible = debugCameraEnabled
			? isEntityVisibleInDebug(entity, camera, canvas.width, canvas.height)
			: isEntityVisible(entity, camera, canvas.width, canvas.height);

		if (isVisible) {
			drawPlayer(context, entity);
		}
	});

	context.restore();
}
