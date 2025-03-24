import { loadSkinConfig } from './skinConfig.js';
import {
	drawAccelerationEffect,
	drawFireBoostEffect,
	drawGrowthEffect,
	drawInvincibilityEffect,
} from './effects.js';

export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

let debugCameraEnabled = false;
let debugPlayerEnabled = false;
let debugEntityEnable = false;
let debugGridEnabled = false;

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};

let skinConfig;

(async () => {
	skinConfig = await loadSkinConfig('');
})();

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
	context.save();
	context.strokeStyle = 'white';
	context.fillStyle = 'rgba(255, 255, 255, 0.2)';
	context.lineWidth = 3;
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
	context.restore();
}

export function drawPlayer(context, player) {
	if (!skinConfig) return;

	if (player.isBoosted) {
		drawFireBoostEffect(context, player);
	} else if (player.isAccelerating) {
		drawAccelerationEffect(context, player);
	}
	context.save();
	context.translate(player.x, player.y);
	context.scale(player.radius / 224, player.radius / 224);
	context.translate(-224, -224);

	// Bordure du halo lumineux
	context.beginPath();
	context.ellipse(224.001, 391.986, 192, 48, 0, 0, 2 * Math.PI);
	context.strokeStyle = skinConfig.halo.border.color;
	context.lineWidth = 1.5;
	context.stroke();

	// Halo lumineux autour du vaisseau
	context.beginPath();
	context.moveTo(224, 344.014);
	context.bezierCurveTo(315.806, 344.014, 392.451, 360.133, 411.402, 381.661);
	context.lineTo(338.626, 275.842);
	context.lineTo(333.376, 277.139);
	context.bezierCurveTo(266.751, 293.545, 181.235, 293.545, 114.61, 277.139);
	context.lineTo(109.36, 275.842);
	context.lineTo(35.411, 382.97);
	context.lineTo(35.516, 382.97);
	context.bezierCurveTo(52.45, 360.789, 130.341, 344.014, 224, 344.014);
	context.closePath();
	context.fillStyle = skinConfig.halo.fill.color;
	context.fill();

	// Halo lumineux sous le vaisseau
	context.beginPath();
	context.ellipse(224.001, 391.986, 192, 48, 0, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.halo.under.color;
	context.fill();

	// Base du vaisseau
	context.beginPath();
	context.ellipse(224.001, 199.986, 224, 96, 0, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.base.color;
	context.fill();

	// Lumière et ombre sur la vitre du vaisseau
	context.beginPath();
	context.moveTo(96.972, 120.983);
	context.bezierCurveTo(96.414, 126.039, 96.063, 131.143, 96.143, 136.329);
	context.bezierCurveTo(96.217, 141.142, 98.683, 145.693, 102.545, 148.567);
	context.bezierCurveTo(130.088, 169.066, 160.979, 184.015, 224.001, 184.015);
	context.bezierCurveTo(287.914, 184.015, 319.457, 169.066, 346.901, 148.567);
	context.bezierCurveTo(350.761, 145.694, 353.227, 141.143, 353.3, 136.331);
	context.bezierCurveTo(353.379, 131.146, 353.026, 126.041, 352.465, 120.981);
	context.bezierCurveTo(316.357, 110.301, 272.634, 104.014, 224.443, 104.014);
	context.bezierCurveTo(177.25, 104.013, 133.524, 110.301, 96.972, 120.983);
	context.closePath();
	context.fillStyle = skinConfig.ship.window.lightShadow.color;
	context.fill();

	// Ombre sous le vaisseau
	context.beginPath();
	context.moveTo(224, 267.761);
	context.bezierCurveTo(111.294, 267.761, 18.296, 232.051, 2.594, 185.612);
	context.bezierCurveTo(0.92, 190.31, 0, 195.113, 0, 200.014);
	context.bezierCurveTo(0, 253.033, 100.288, 296.014, 224, 296.014);
	context.bezierCurveTo(347.712, 296.014, 448, 253.033, 448, 200.014);
	context.bezierCurveTo(448, 195.112, 447.08, 190.31, 445.406, 185.612);
	context.bezierCurveTo(429.705, 232.051, 336.707, 267.761, 224, 267.761);
	context.closePath();
	context.fillStyle = skinConfig.ship.shadow.color;
	context.fill();

	// Bordure entre la vitre et le vaisseau
	context.beginPath();
	context.moveTo(346.355, 147.518);
	context.bezierCurveTo(330.775, 135.694, 282.152, 127.014, 224.001, 127.014);
	context.bezierCurveTo(165.851, 127.014, 117.228, 135.694, 101.648, 147.519);
	context.bezierCurveTo(101.996, 147.829, 102.17, 148.286, 102.546, 148.567);
	context.bezierCurveTo(130.089, 169.066, 160.98, 184.015, 224.001, 184.015);
	context.bezierCurveTo(287.914, 184.015, 319.457, 169.066, 346.901, 148.567);
	context.bezierCurveTo(347.276, 148.288, 347.45, 147.829, 347.798, 147.518);
	context.closePath();
	context.fillStyle = skinConfig.ship.window.border.color;
	context.fill();

	// Zone lumineuse dans le vaisseau
	context.beginPath();
	context.moveTo(346.355, 147.518);
	context.bezierCurveTo(330.775, 135.694, 282.152, 127.014, 224.001, 127.014);
	context.bezierCurveTo(165.851, 127.014, 117.228, 135.694, 101.648, 147.519);
	context.bezierCurveTo(101.996, 147.829, 102.17, 148.286, 102.546, 148.567);
	context.bezierCurveTo(130.089, 169.066, 160.98, 184.015, 224.001, 184.015);
	context.bezierCurveTo(287.914, 184.015, 319.457, 169.066, 346.901, 148.567);
	context.bezierCurveTo(347.276, 148.288, 347.45, 147.829, 347.798, 147.518);
	context.closePath();
	context.fillStyle = skinConfig.ship.interior.light.color;
	context.fill();

	// Haut de la vitre
	context.beginPath();
	context.moveTo(224, 104.014);
	context.bezierCurveTo(271.19, 104.014, 314.913, 110.301, 351.022, 121.981);
	context.bezierCurveTo(344.159, 59.014, 290.779, 8.014, 224, 8.014);
	context.bezierCurveTo(157.47, 8.014, 103.835, 58.812, 96.972, 120.983);
	context.bezierCurveTo(133.081, 110.302, 176.807, 104.014, 224, 104.014);
	context.closePath();
	context.fillStyle = skinConfig.ship.window.top.color;
	context.fill();

	// Alien à l'intérieur du vaisseau
	context.beginPath();
	context.moveTo(224, 184.014);
	context.bezierCurveTo(242.03, 184.014, 257.206, 182.674, 270.65, 180.447);
	context.bezierCurveTo(276.401, 166.791, 280, 151.125, 280, 135.014);
	context.bezierCurveTo(280, 104.139, 254.875, 79.014, 224, 79.014);
	context.bezierCurveTo(193.125, 79.014, 168, 104.139, 168, 135.014);
	context.bezierCurveTo(168, 151.125, 171.598, 166.791, 177.35, 180.447);
	context.bezierCurveTo(190.794, 182.674, 205.97, 184.014, 224, 184.014);
	context.closePath();
	context.fillStyle = skinConfig.alien.body.color;
	context.fill();

	// Cornes de l'alien
	context.beginPath();
	context.moveTo(200, 100);
	context.bezierCurveTo(190, 80, 180, 70, 185, 50);
	context.bezierCurveTo(190, 70, 200, 80, 210, 90);
	context.closePath();
	context.fillStyle = skinConfig.alien.horn.left.color;
	context.fill();

	context.beginPath();
	context.moveTo(248, 100);
	context.bezierCurveTo(258, 80, 268, 70, 263, 50);
	context.bezierCurveTo(258, 70, 248, 80, 238, 90);
	context.closePath();
	context.fillStyle = skinConfig.alien.horn.right.color;
	context.fill();

	// Ronds autour des phares du vaisseau
	context.beginPath();
	context.arc(224, 216.014, 32, 0, 2 * Math.PI);
	context.moveTo(80, 192.014);
	context.arc(80, 192.014, 32, 0, 2 * Math.PI);
	context.moveTo(368, 192.014);
	context.arc(368, 192.014, 32, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.lights.rings.color;
	context.fill();

	// Oeil gauche de l'alien
	context.beginPath();
	context.ellipse(
		197.909,
		147.403,
		20.257,
		10.128,
		(-148.54 * Math.PI) / 180,
		0,
		2 * Math.PI
	);
	context.fillStyle = skinConfig.alien.eye.left.color;
	context.fill();

	// Oeil droit de l'alien
	context.beginPath();
	context.ellipse(
		250.008,
		147.414,
		10.128,
		20.256,
		(-121.46 * Math.PI) / 180,
		0,
		2 * Math.PI
	);
	context.fillStyle = skinConfig.alien.eye.right.color;
	context.fill();

	// Lumière sur la vitre du vaisseau (rendue transparente)
	context.beginPath();
	context.moveTo(219.53, 79.466);
	context.arc(188.521, 87.014, 32, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.window.light.color;
	context.fill();

	// Phare central du vaisseau
	context.beginPath();
	context.arc(224, 216.014, 16, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.light.center.color;
	context.fill();

	// Phare gauche du vaisseau
	context.beginPath();
	context.arc(80, 192.014, 16, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.light.left.color;
	context.fill();

	// Phare droit du vaisseau
	context.beginPath();
	context.arc(368, 192.014, 16, 0, 2 * Math.PI);
	context.fillStyle = skinConfig.ship.light.right.color;
	context.fill();

	context.restore();
	if (debugPlayerEnabled) {
		drawDebugPlayer(context, player); // debug
	}

	if (player.isInvincible) {
		drawInvincibilityEffect(context, player);
	}

	if (player.justGotBigger) {
		drawGrowthEffect(context, player);
	}

	if (player.justEatSomeone) {
		// ... code pour le halo quand on mange quelqu'un ...
	}
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
