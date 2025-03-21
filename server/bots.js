import { Player } from './player.js';
import { maxWidth, maxHeight } from './constants.js';
import { stains } from './index.js';
export class Bots {
	constructor(count) {
		this.bots = [];
		this.createBots(count);
	}

	createBots(count) {
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * maxWidth);
			const y = Math.floor(Math.random() * maxHeight);
			const bot = new Player(30, x, y, 0, 0, false);
			this.bots.push(bot);
		}
	}

	updateBots() {
		this.bots.forEach(bot => {
			// Changer la direction de manière aléatoire, mais en douceur
			if (Math.random() < 0.02) { // 2% de chance de changer de direction à chaque frame
				bot.vx = (Math.random() * 4 - 2); // Vitesse horizontale entre -2 et 2
				bot.vy = (Math.random() * 4 - 2); // Vitesse verticale entre -2 et 2
	
				// Garantir que la vitesse n'est jamais nulle
				if (bot.vx === 0) bot.vx = Math.random() < 0.5 ? 1 : -1; // Éviter vx = 0
				if (bot.vy === 0) bot.vy = Math.random() < 0.5 ? 1 : -1; // Éviter vy = 0
			}
	
			// Appliquer le mouvement
			bot.x += bot.vx;
			bot.y += bot.vy;
	
			// Mettre à jour la position du bot en fonction des taches (stains)
			bot.movePlayer(stains);
		});
	}
}
