export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

let debugCameraEnabled = false;
let debugPlayerEnabled = false;
let debugEntityEnable = false;
let debugGridEnabled = false; // Nouveau drapeau pour afficher la grille

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
export function setDebugEntityMode(enabled) {
	debugEntityEnable = enabled;
}
export function setDebugGridMode(enabled) {
	debugGridEnabled = enabled;
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
	const halfWidth = canvasWidth / 4 / camera.zoom;
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

// ==================== FONCTIONS DE DESSIN ====================

function drawDebugPlayer(context, player) {
	const maxDistance = Math.min(canvas.width, canvas.height) / 4;
	context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	context.lineWidth = 2;
	context.beginPath();
	context.arc(player.x, player.y, maxDistance, 0, 2 * Math.PI);
	context.stroke();
}

export function drawPlayer(context, player) {
	context.save();
	context.fillStyle = debugEntityEnable ? 'rgba(255, 255, 255, 0.2)' : 'white';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();
	context.restore();

	if (debugPlayerEnabled) {
		drawDebugPlayer(context, player); // méthode de débogage
	}

	if (debugEntityEnable) {
		// hitbox (bordure blanche)
		context.strokeStyle = 'white';
		context.lineWidth = 1;
		context.beginPath();
		context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
		context.stroke();
	}

	// score du joueur
	context.save();
	context.fillStyle = 'black';
	context.font = '16px Arial';
	context.textAlign = 'center';
	context.fillText(
		`Score: ${player.score}`,
		player.x,
		player.y - player.radius - 10
	); // au dessus
	context.restore();
}
function drawDebugEntity(context, entity) {
	// transparent avec bordure
	context.save();
	context.strokeStyle =
		entity.type === 'VITESSE' || entity.type === 'TAILLE' ? 'yellow' : 'red';
	context.fillStyle =
		entity.type === 'VITESSE' || entity.type === 'TAILLE'
			? 'rgba(255, 255, 0, 0.2)'
			: 'rgba(255, 0, 0, 0.2)';
	context.lineWidth = 1;
	context.beginPath();
	context.arc(entity.x, entity.y, entity.radius, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
	context.restore();
}

function adjustSplatterPosition(context, stain) {
	const svgOffset = stain.radius;
	context.translate(stain.x - svgOffset, stain.y - svgOffset);
}

function drawStain(context, stain) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// couleurs
	// TODO: Ajouter les couleurs de plein de sauces diférente
	const baseColor = '#E5C985 ';
	const shadowColor = '#B99850 ';

	context.save();

	// ajuste la position pour centrer le SVG sur la hitbox
	adjustSplatterPosition(context, stain);

	// adapte la taille du SVG
	context.scale(stain.radius / 256, stain.radius / 256);

	// base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	// ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	context.restore();

	if (debugEntityEnable) {
		drawDebugEntity(context, stain); // debug
	}
}

export function drawBonus(context, bonus) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// couleurs ( piménté, sauce barbecue)
	const baseColor = bonus.type === 'VITESSE' ? '#ff4500' : '#8b4513';
	const shadowColor = bonus.type === 'VITESSE' ? '#cc3700' : '#6b3a10';

	context.save();
	adjustSplatterPosition(context, bonus);

	context.scale(bonus.radius / 256, bonus.radius / 256);

	// base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	// ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	context.restore();

	if (debugEntityEnable) {
		drawDebugEntity(context, bonus); // debug
	}
}

function drawCamera(context, camera, canvasWidth, canvasHeight) {
	if (!debugCameraEnabled) return;

	const halfWidth = canvasWidth / 3 / camera.zoom;
	const halfHeight = canvasHeight / 3 / camera.zoom;

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

// Fonction pour dessiner la grid
function drawGrid(context, camera, canvasWidth, canvasHeight, chunkSize) {
	const halfWidth = canvasWidth / 2 / camera.zoom;
	const halfHeight = canvasHeight / 2 / camera.zoom;

	const cameraLeft = camera.x - halfWidth;
	const cameraRight = camera.x + halfWidth;
	const cameraTop = camera.y - halfHeight;
	const cameraBottom = camera.y + halfHeight;

	context.save();

	if (debugGridEnabled) {
		// Affiche la grille avec des lignes
		context.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Couleur blanche pour les lignes
		context.lineWidth = 1;

		// Dessine les lignes verticales
		for (
			let x = Math.floor(cameraLeft / chunkSize) * chunkSize;
			x <= cameraRight;
			x += chunkSize
		) {
			context.beginPath();
			context.moveTo(x, cameraTop);
			context.lineTo(x, cameraBottom);
			context.stroke();
		}

		// Dessine les lignes horizontales
		for (
			let y = Math.floor(cameraTop / chunkSize) * chunkSize;
			y <= cameraBottom;
			y += chunkSize
		) {
			context.beginPath();
			context.moveTo(cameraLeft, y);
			context.lineTo(cameraRight, y);
			context.stroke();
		}
	} else {
		// Affiche la grille avec des croix
		context.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Couleur blanche pour les croix
		context.lineWidth = 1;

		// Dessine les points en forme de croix
		for (
			let x = Math.floor(cameraLeft / chunkSize) * chunkSize;
			x <= cameraRight;
			x += chunkSize
		) {
			for (
				let y = Math.floor(cameraTop / chunkSize) * chunkSize;
				y <= cameraBottom;
				y += chunkSize
			) {
				context.beginPath();
				// Petite croix
				const crossSize = 5; // Taille de la croix
				context.moveTo(x - crossSize, y);
				context.lineTo(x + crossSize, y);
				context.moveTo(x, y - crossSize);
				context.lineTo(x, y + crossSize);
				context.stroke();
			}
		}
	}

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

	// Dessine la grid si le mode debug est activé
	drawGrid(context, camera, canvas.width, canvas.height, 200); // Taille des chunkules = 200

	// debug de la caméra
	drawCamera(context, camera, canvas.width, canvas.height);

	// uniquement les entités visibles
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

	// interpolation des autres joueurs (oui)
	const deltaTime = 1 / 60; // 60 FPS
	for (const id in otherPlayers) {
		interpolatePlayerPosition(otherPlayers[id], deltaTime);
		drawPlayer(context, otherPlayers[id]);
	}

	// uniquement les joueurs visibles
	bots.forEach(entity => {
		const isVisible = debugCameraEnabled
			? isEntityVisibleInDebug(entity, camera, canvas.width, canvas.height)
			: isEntityVisible(entity, camera, canvas.width, canvas.height);

		if (isVisible) {
			drawPlayer(context, entity);
		}
	});

	// dessine le joueur local
	drawPlayer(context, player);

	context.restore();
}
