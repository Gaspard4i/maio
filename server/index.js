import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './player.js';
import { Bots } from './bots.js';
import { Stains } from './stains.js';
import { Grid } from './Grid.js';
import {
	PORT,
	NUM_BOTS,
	NUM_STAINS,
	CHUNK_SIZE,
	MAX_WIDTH,
	MAX_HEIGHT,
	TICK_RATE,
	DEFAULT_PLAYER,
} from './constants.js';

const httpServer = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Connected');
});

const port = process.env.PORT !== undefined ? process.env.PORT : PORT;
httpServer.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

const io = new IOServer(httpServer, { cors: true });
export const players = {}; //stocke les joueurs
const bots = new Bots(NUM_BOTS); // stock les bots
export const stains = new Stains(NUM_STAINS); // stock les stains (tâches)
const inputQueue = {}; // File des entrées par joueur
const grid = new Grid(CHUNK_SIZE, MAX_WIDTH, MAX_HEIGHT);

export const initializePlayer = socketId => {
	const player = new Player(
		DEFAULT_PLAYER.radius,
		DEFAULT_PLAYER.x,
		DEFAULT_PLAYER.y,
		DEFAULT_PLAYER.velocityX,
		DEFAULT_PLAYER.velocityY,
		DEFAULT_PLAYER.isAccelerating
	);
	players[socketId] = player;
};

export const handleInput = (socketId, bitmask) => {
	inputQueue[socketId] = bitmask;
};

export const removePlayer = socketId => {
	delete players[socketId];
	delete inputQueue[socketId];
};

export const processGameTick = () => {
	// réinitialisation de grid
	grid.clear();

	// ajoute les joueurs, bots et stains à la grille
	Object.values(players).forEach(player => grid.addEntity(player));
	bots.bots.forEach(bot => grid.addEntity(bot));
	stains.getAll().forEach(stain => grid.addEntity(stain));

	for (const [id, bitmask] of Object.entries(inputQueue)) {
		const player = players[id];
		if (player) {
			player.keys = {
				ArrowUp: !!(bitmask & 0b0001),
				ArrowDown: !!(bitmask & 0b0010),
				ArrowLeft: !!(bitmask & 0b0100),
				ArrowRight: !!(bitmask & 0b1000),
				Shift: !!(bitmask & 0b10000),
			};
			player.updateVelocity(); // maj la vitesse
		}
	}

	// maj les entités
	for (const player of Object.values(players)) {
		player.movePlayer(stains, grid); // grid pour les collisions
	}
	bots.updateBots(grid);
	stains.updateStains(players); // Passe players ici

	// maj les clients
	io.emit('updatePlayers', players);
	io.emit('updateBots', bots);
	io.emit('updateStains', stains);
};

function handleMouseMovement(socketId, x, y, canvaWidth, canvaHeight) {
	const player = players[socketId];
	const dx = x - canvaWidth / 2;
	const dy = y - canvaHeight / 2;
	player.updateMouseMovement(dx, dy, canvaWidth, canvaHeight);
}

function handleMouseMovementAcceleration(socketId, bool) {
	const player = players[socketId];
	player.isAccelerating = bool;
}

io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	initializePlayer(socket.id);

	socket.on('input', bitmask => {
		handleInput(socket.id, bitmask);
	});

	socket.on('mousemove', ({ x, y, canvaWidth, canvaHeight }) => {
		handleMouseMovement(socket.id, x, y, canvaWidth, canvaHeight);
	});

	socket.on('mousedown', ({ bool }) => {
		handleMouseMovementAcceleration(socket.id, bool);
	});

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
		removePlayer(socket.id);
	});
});

// traitement du jeu
setInterval(processGameTick, TICK_RATE);
