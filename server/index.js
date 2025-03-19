import http from 'http';
import { Server as IOServer } from 'socket.io';

export const maxWidth = 10000;
export const maxHeight = 10000;
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
io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	player = new Player(30, canvas.width / 2, canvas.height / 2, 0, 0, false);

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
	});
});
