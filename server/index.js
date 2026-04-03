import http from 'http';
import fs from 'fs';
import path from 'path';
import { Server as IOServer } from 'socket.io';
import { Player, BotPlayer } from './player.js';
import { Stains } from './stains.js';
import { Grid } from './grid.js';
import {
	PORT,
	NUM_BOTS,
	NUM_STAINS,
	CHUNK_SIZE,
	MAX_WIDTH,
	MAX_HEIGHT,
	TICK_RATE,
	DEFAULT_PLAYER,
	MAX_PLAYERS,
} from './config.js';

/////////////////// SERVEUR HTTP + STATIC ///////////////////
const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.json': 'application/json',
};

const clientDir = path.resolve(import.meta.dirname, '../client/public');

const httpServer = http.createServer((req, res) => {
	let filePath = path.join(clientDir, req.url === '/' ? 'index.html' : req.url);
	const ext = path.extname(filePath);
	const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

	fs.readFile(filePath, (err, data) => {
		if (err) {
			// Fallback to index.html for SPA
			fs.readFile(path.join(clientDir, 'index.html'), (err2, data2) => {
				if (err2) {
					res.writeHead(404);
					res.end('Not Found');
					return;
				}
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(data2);
			});
			return;
		}
		res.writeHead(200, { 'Content-Type': mimeType });
		res.end(data);
	});
});

const port = process.env.PORT || PORT;
httpServer.listen(port, '0.0.0.0', () =>
	console.log(`MA.IO server running at http://0.0.0.0:${port}/`)
);

/////////////////// SOCKET.IO ///////////////////
const io = new IOServer(httpServer, { cors: { origin: '*' } });

/////////////////// VARIABLES GLOBALES ///////////////////
export const players = {};
export const stains = new Stains(NUM_STAINS);
const inputQueue = {};
const grid = new Grid(CHUNK_SIZE, MAX_WIDTH, MAX_HEIGHT);

/////////////////// INITIALISATION ///////////////////
export const initializePlayer = (socketId, pseudo = 'Joueur', startTime) => {
	if (Object.keys(players).length >= MAX_PLAYERS) {
		io.to(socketId).emit('gameFull'); // Notifie le client que le jeu est plein
		console.log(
			`Connexion refusée : le jeu est plein (${MAX_PLAYERS} joueurs).`
		);
		return;
	}
	players[socketId] = new Player(
		socketId,
		DEFAULT_PLAYER.radius,
		DEFAULT_PLAYER.x,
		DEFAULT_PLAYER.y,
		DEFAULT_PLAYER.velocityX,
		DEFAULT_PLAYER.velocityY,
		pseudo, // Utilisation du pseudo fourni
		startTime
	);
	console.log(
		`Nouveau joueur ${socketId} initialisé avec le pseudo "${pseudo}".`
	);
};

export const createBots = count => {
	for (let i = 0; i < count; i++) {
		const bot = new BotPlayer(
			DEFAULT_PLAYER.radius,
			Math.random() * MAX_WIDTH,
			Math.random() * MAX_HEIGHT,
			DEFAULT_PLAYER.velocityX,
			DEFAULT_PLAYER.velocityY
		);
		players[bot.id] = bot;
	}
};

createBots(NUM_BOTS);

/////////////////// GESTION DES ENTRÉES ///////////////////
export const handleInput = (socketId, bitmask) => {
	inputQueue[socketId] = bitmask;
};

export const removePlayer = socketId => {
	delete players[socketId];
	delete inputQueue[socketId];
};

/////////////////// TRAITEMENT DU JEU ///////////////////
export const processGameTick = () => {
	grid.clear();

	// ajoute les entités à la grille
	[...Object.values(players), ...stains.getAll()].forEach(entity =>
		grid.addEntity(entity)
	);

	// traite les entrées des joueurs
	Object.entries(inputQueue).forEach(([id, bitmask]) => {
		const player = players[id];
		if (player) {
			player.keys = {
				ArrowUp: !!(bitmask & 0b0001),
				ArrowDown: !!(bitmask & 0b0010),
				ArrowLeft: !!(bitmask & 0b0100),
				ArrowRight: !!(bitmask & 0b1000),
				Shift: !!(bitmask & 0b10000),
			};
			player.updateVelocity();
		}
	});

	// maj les entités
	Object.values(players).forEach(player => {
		player.isBot
			? player.updateBotMovement(grid, stains, players, io)
			: player.movePlayer(stains, grid, players, io);
	});

	stains.updateStains(players);

	// sync tout
	io.emit('updatePlayers', players);
	io.emit('updateStains', stains);
};

/////////////////// GESTION DES ÉVÉNEMENTS SOCKET ///////////////////
const handlePlayerAction = (socketId, action, ...args) => {
	const player = players[socketId];
	if (!player) {
		return null;
	}
	return action(player, ...args);
};

io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	socket.on('joinGame', ({ pseudo, startTime }) =>
		initializePlayer(socket.id, pseudo, startTime)
	);

	socket.on('input', bitmask =>
		handlePlayerAction(socket.id, () => handleInput(socket.id, bitmask))
	);

	socket.on('mousemove', ({ x, y, canvaWidth, canvaHeight }) =>
		handlePlayerAction(socket.id, player =>
			player.updateMouseMovement(
				x - canvaWidth / 2,
				y - canvaHeight / 2,
				canvaWidth,
				canvaHeight
			)
		)
	);

	socket.on('mousedown', isAccelerating =>
		handlePlayerAction(socket.id, player => {
			// active ou désactive l'accel
			player.isAccelerating = isAccelerating;
		})
	);

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
		removePlayer(socket.id);
	});
});

/////////////////// BOUCLE DE JEU ///////////////////
setInterval(processGameTick, TICK_RATE);
