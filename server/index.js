import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './player.js';
import { Bots } from './bots.js';
import { Stains } from './stains.js';
import { maxWidth, maxHeight, TICK_RATE } from './constants.js';

export let player;
const httpServer = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Connected');
});

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
httpServer.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

const io = new IOServer(httpServer, { cors: true });
const players = {}; // Utilisation d'un objet pour stocker les joueurs
const bots = new Bots(10); // bots
export const stains = new Stains(1500); // stains
const inputQueue = {}; // File d'attente des entrées par joueur

export const initializePlayer = socketId => {
	const player = new Player(30, maxWidth / 2, maxHeight / 2, 0, 0, false);
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
			player.updateVelocity(); // Met à jour la vitesse en fonction des touches
			player.movePlayer(stains); // Déplace le joueur
		}
	}
	// Met à jour les bots et les taches
	bots.updateBots();
	stains.updateStains();

	// mises à jour des clients
	io.emit('updatePlayers', players);
	io.emit('updateBots', bots);
	io.emit('updateStains', stains);
};

io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	initializePlayer(socket.id);

	socket.on('input', bitmask => {
		handleInput(socket.id, bitmask);
	});

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
		removePlayer(socket.id);
	});
});

// Traitement des entrées à un tick rate fixe
setInterval(processGameTick, TICK_RATE);
