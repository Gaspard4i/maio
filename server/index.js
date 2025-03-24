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
} from './config.js';

/////////////////// SERVEUR HTTP ///////////////////
const httpServer = http.createServer((req, res) => {
	// redirection vers la page 8000
	res.writeHead(302, { Location: 'http://localhost:8000' });
	res.end();
});

const port = process.env.PORT || PORT;
httpServer.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

/////////////////// SOCKET.IO ///////////////////
const io = new IOServer(httpServer, { cors: true });

/////////////////// VARIABLES GLOBALES ///////////////////
export const players = {}; // stocke les players (humains et bots)
export const stains = new Stains(NUM_STAINS); // stocke les taches
const inputQueue = {}; // entrées clavier par joueur
const grid = new Grid(CHUNK_SIZE, MAX_WIDTH, MAX_HEIGHT);

/////////////////// INITIALISATION ///////////////////
export const initializePlayer = socketId => {
	const player = new Player(
		socketId,
		DEFAULT_PLAYER.radius,
		DEFAULT_PLAYER.x,
		DEFAULT_PLAYER.y,
		DEFAULT_PLAYER.velocityX,
		DEFAULT_PLAYER.velocityY,
		DEFAULT_PLAYER.isAccelerating
	);
	console.log(`Nouveau joueur ${player.id} :`, player);
	players[player.id] = player;
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
	// réinitialisation de grid
	grid.clear();

	// ajoute les joueurs, bots et stains à la grille
	Object.values(players).forEach(player => grid.addEntity(player));
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
		if (player.isBot) {
			player.updateBotMovement(grid, stains, players, io);
		} else {
			player.movePlayer(stains, grid, players, io); // redirect
		}
	}

	// maj des taches
	stains.updateStains(players);

	// verification des joueurs mangés
	for (const id in players) {
		if (players[id].isEaten) {
			removePlayer(id);
		}
	}

	// sync tout
	io.emit('updatePlayers', players);
	io.emit('updateStains', stains);
};

/////////////////// GESTION DES ÉVÉNEMENTS SOCKET ///////////////////
function handleMouseMovement(socketId, x, y, canvaWidth, canvaHeight) {
	const player = players[socketId];
	if (!player) {
		console.warn(`Player with socket ID ${socketId} not found.`);
		return; // Évite l'erreur si le joueur n'existe pas
	}
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

	socket.on('joinGame', () => {
		initializePlayer(socket.id);
	});

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

/////////////////// BOUCLE DE JEU ///////////////////
setInterval(processGameTick, TICK_RATE);
