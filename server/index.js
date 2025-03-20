import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './player.js';
import { Bots } from './bots.js';
import { Stains } from './stains.js';
import { maxWidth, maxHeight } from './constants.js';

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
const players = []; // Liste des joueurs connectés
const bots = new Bots(10); // Create 10 bots
export const stains = new Stains(10); // Create 1000 stains

io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	const player = new Player(30, maxWidth / 2, maxHeight / 2, 0, 0, false);
	players[socket.id] = player;

	socket.on('updatePlayer', data => {
		// Met à jour la position et les propriétés du joueur associé
		const player = players[socket.id];
		if (player) {
			player.x = data.x;
			player.y = data.y;
			player.vx = data.vx;
			player.vy = data.vy;
			player.radius = data.radius;
		}
	});

	// Envoie les données des joueurs à tous les clients
	setInterval(() => {
		bots.updateBots();
		stains.updateStains();
		io.emit('updatePlayers', players);
		io.emit('updateBots', bots);
		io.emit('updateStains', stains);
	}, 20);

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
		delete players[socket.id]; // Supprime le joueur de la liste
	});
});
