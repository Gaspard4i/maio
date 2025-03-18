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

	describe('applyAcceleration', () => {
		it('should reduce radius when accelerating', () => {
			const player = new Player(30, 0, 0, 0, 0, true);
			player.keys['Shift'] = true;
			player.applyAcceleration();
			assert.equal(player.isAccelerating, true);
			assert(player.radius < 30);
		});
	});

	describe('applyFriction', () => {
		it('should reduce velocity when sliding', () => {
			const player = new Player(30, 0, 0, 10, 10, true);
			player.isSliding = true;
			player.applyFriction();
			assert(player.vx < 10);
			assert(player.vy < 10);
		});

		it('should stop sliding when velocity is near zero', () => {
			const player = new Player(30, 0, 0, 0.05, 0.05, true);
			player.isSliding = true;
			player.applyFriction();
			assert.equal(player.vx, 0);
			assert.equal(player.vy, 0);
			assert.equal(player.isSliding, false);
		});
	});

	describe('updateVelocity', () => {
		it('should update velocity based on keys pressed', () => {
			const player = new Player(30, 0, 0, 0, 0, true);
			player.keys['ArrowRight'] = true;
			player.updateVelocity();
			assert(player.vx > 0);
			assert.equal(player.vy, 0);
		});

		it('should use accelerated speed when Shift is pressed', () => {
			const player = new Player(30, 0, 0, 0, 0, true);
			player.keys['Shift'] = true;
			player.keys['ArrowUp'] = true;
			player.updateVelocity();
			assert(player.vy < 0);
			assert.equal(player.vx, 0);
			assert(player.isAccelerating);
		});
	});
});
