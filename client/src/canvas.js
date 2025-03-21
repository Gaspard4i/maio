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
	const svgPathHalo = new Path2D(
		'M224 344.014c91.806 0 168.451 16.119 187.402 37.647l-72.776-105.819-5.25 1.297c-66.625 16.406-152.141 16.406-218.766 0l-5.25-1.297L35.411 382.97h.105C52.45 360.789 130.341 344.014 224 344.014z'
	);
	const svgPathBase = new Path2D(
		'M224.001 199.986c-112.706 0-205.704-35.71-221.406-82.149C.92 190.31 0 195.113 0 200.014c0 53.019 100.288 96 224 96s224-42.981 224-96c0-4.902-.92-9.705-2.594-14.402-15.701 46.438-108.7 82.149-221.406 82.149z'
	);
	const svgPathAlien = new Path2D(
		'M224 184.014c18.03 0 33.206-1.34 46.65-3.567 5.751-13.656 9.35-29.322 9.35-45.433 0-30.875-25.125-56-56-56s-56 25.125-56 56c0 16.11 3.598 31.776 9.35 45.433 13.444 2.227 28.62 3.567 46.65 3.567z'
	);
	const svgPathEyesLeft = new Path2D(
		'M197.909 147.403c-20.257 0-20.257-10.128 0-10.128s20.257 10.128 0 10.128z'
	);
	const svgPathEyesRight = new Path2D(
		'M250.008 147.414c-10.128 0-10.128-20.256 0-20.256s10.128 20.256 0 20.256z'
	);
	const svgPathLight = new Path2D(
		'M219.53 79.466c-3.406-14.012-15.948-24.452-31.009-24.452-17.673 0-32 14.326-32 32 0 11.631 6.267 21.714 15.548 27.316 7.721-19.305 25.875-33.12 47.461-34.864z'
	);

	context.save();
	context.translate(player.x, player.y);
	context.scale(player.radius / 224, player.radius / 224); // Adapter la taille du SVG

	// Dessiner le halo
	context.fillStyle = '#deefdd';
	context.fill(svgPathHalo);

	// Dessiner la base du vaisseau
	context.fillStyle = '#7f8fa0';
	context.fill(svgPathBase);

	// Dessiner l'alien
	context.fillStyle = '#acc6b9';
	context.fill(svgPathAlien);

	// Dessiner les yeux de l'alien
	context.fillStyle = '#000000';
	context.fill(svgPathEyesLeft);
	context.fill(svgPathEyesRight);

	// Dessiner la lumière sur la vitre
	context.fillStyle = '#dce7f6';
	context.fill(svgPathLight);

	context.restore();

	if (debugPlayerEnabled) {
		drawDebugPlayer(context, player); // Appel de la méthode de débogage
	}
}

function drawStain(context, stain) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// Couleurs pour les taches de base
	const baseColor = '#E5C985 ';
	const shadowColor = '#B99850 ';

	context.save();
	context.translate(stain.x, stain.y);
	context.scale(stain.radius / 256, stain.radius / 256); // Adapter la taille du SVG

	// Dessiner la couleur de base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	// Dessiner l'ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	context.restore();
}

export function drawBonus(context, bonus) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// Couleurs pour les bonus
	const baseColor = bonus.type === 'VITESSE' ? '#ff5733' : '#33c1ff';
	const shadowColor = bonus.type === 'VITESSE' ? '#cc4629' : '#2a99cc';

	context.save();
	context.translate(bonus.x, bonus.y);
	context.scale(bonus.radius / 256, bonus.radius / 256); // Adapter la taille du SVG

	// Dessiner l'ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	// Dessiner la couleur de base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	context.restore();
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

export function drawGame(context, player, otherPlayers, stains, camera) {
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

	context.restore();
}
