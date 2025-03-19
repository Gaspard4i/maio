import { camera } from '../server/camera.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Camera Zoom Adjustment', () => {
	it('should set zoom correctly for large player', () => {
		const playerRadius = 60;
		camera.adjustZoomForPlayerSize(playerRadius);
		assert.strictEqual(camera.zoom, 0.5);
	});

	it('should set zoom correctly for small player', () => {
		const playerRadius = 10;
		camera.adjustZoomForPlayerSize(playerRadius);
		assert.strictEqual(camera.zoom, camera.maxZoom);
	});

	it('should set zoom correctly for medium player', () => {
		const playerRadius = 30;
		camera.adjustZoomForPlayerSize(playerRadius);
		assert.strictEqual(camera.zoom, 1);
	});
});
