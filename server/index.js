import http from 'http';
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

/////////////////// SERVEUR HTTP ///////////////////
const httpServer = http.createServer((req, res) => {
	res.writeHead(302, { Location: 'http://localhost:8000' });
	res.end();
});

const port = process.env.PORT || PORT;
httpServer.listen(port, () =>
	console.log(`Server running at http://localhost:${port}/`)
);

/////////////////// SOCKET.IO ///////////////////
const io = new IOServer(httpServer, { cors: true });

/////////////////// VARIABLES GLOBALES ///////////////////
export const players = {};
export const leaderboard = {};
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
