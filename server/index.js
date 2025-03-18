import http from 'http';
import { argv } from 'process';
import { Server as IOServer } from 'socket.io';

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
});
