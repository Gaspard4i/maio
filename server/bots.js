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
			bot.vx = Math.random() * 2 - 1; 
			bot.vy = Math.random() * 2 - 1; 
			bot.movePlayer(stains);
		});
	}
}
