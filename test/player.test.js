import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import { Player } from '../src/player.js';
import { BonusType } from '../src/bonus.js';

describe('Player Module', () => {
	it('Score should up when player grow', () => {
		const player = new Player(0, 0, 0, 0, 0, false);
		assert.equal(player.score, 0);
		player.grow();
		assert.equal(player.score, 15);
	});

	it('Speed should update correctly', () => {
		const player = new Player(10, 0, 0, 0, 0, false);
		assert.equal(player.speed, 10);
		player.updateSpeed();
		assert.equal(player.speed, 30);
	});

	describe('bonus function', () => {
		it('should up speed after getting speed bonus', () => {
			const player = new Player(10, 0, 0, 0, 0, false);
			assert.equal(player.speed, 10);
			player.bonus(BonusType.VITESSE);
			assert.equal(player.speed, 20);
		});

		it('should grow after get a size bonus', () => {
			const player = new Player(10, 0, 0, 0, 0, false);
			assert.equal(player.radius, 10);
			player.bonus(BonusType.TAILLE);
			assert.equal(player.radius, 15);
		});
	});
});
