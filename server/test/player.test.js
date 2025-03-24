import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import { Player } from '../player.js';
import { BonusType } from '../bonus.js';
import {
	BASE_PLAYER_SPEED,
	BONUS_SIZE_MULTIPLIER,
	BONUS_SPEED_MULTIPLIER,
} from '../config.js';

describe('Player Module', () => {
	it('Score should up when player grow', () => {
		const player = new Player('test', 0, 0, 0, 0, 0, false);
		assert.equal(player.score, 0);
		player.grow();
		assert.equal(player.score, 15);
	});

	it('Speed should update correctly', () => {
		const player = new Player('test', 10, 0, 0, 0, 0, false);
		assert.equal(player.speed, BASE_PLAYER_SPEED);
		player.updateSpeed();
		assert.equal(player.speed, (BASE_PLAYER_SPEED / player.radius) * 40);
	});

	describe('bonus function', () => {
		it('should up speed after getting speed bonus', () => {
			const player = new Player('test', 10, 0, 0, 0, 0, false);
			assert.equal(player.speed, BASE_PLAYER_SPEED);
			player.bonus(BonusType.VITESSE);
			player.updateSpeed();
			assert.equal(
				player.speed,
				(BASE_PLAYER_SPEED / player.radius) * 40 * BONUS_SPEED_MULTIPLIER
			);
		});

		it('should grow and then shrink after getting size bonus', done => {
			const player = new Player('test', 10, 0, 0, 0, 0, false);
			assert.equal(player.radius, 10);
			player.bonus(BonusType.TAILLE);
			assert.equal(player.radius, 10 * BONUS_SIZE_MULTIPLIER);
		});
	});

	describe('applyAcceleration', () => {
		it('should reduce radius when accelerating', () => {
			const player = new Player('test', 30, 0, 0, 0, 0, true);
			player.keys['Shift'] = true;
			player.applyAcceleration();
			assert.equal(player.isAccelerating, true);
			assert(player.radius < 30);
		});
	});

	describe('updateVelocity', () => {
		it('should update velocity based on keys pressed', () => {
			const player = new Player('test', 30, 0, 0, 0, 0, true);
			player.keys['ArrowRight'] = true;
			player.updateVelocity();
			assert(player.vx > 0);
			assert.equal(player.vy, 0);
		});

		it('should use accelerated speed when Shift is pressed', () => {
			const player = new Player('test', 30, 0, 0, 0, 0, true);
			player.keys['Shift'] = true;
			player.keys['ArrowUp'] = true;
			player.updateVelocity();
			assert(player.vy < 0);
			assert.equal(player.vx, 0);
			assert(player.isAccelerating);
		});
	});
});
