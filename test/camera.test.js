import { camera } from '../src/camera';

test('adjustZoomForPlayerSize sets zoom correctly for large player', () => {
	const playerRadius = 60;
	camera.adjustZoomForPlayerSize(playerRadius);
	expect(camera.zoom).toBe(camera.minZoom);
});

test('adjustZoomForPlayerSize sets zoom correctly for small player', () => {
	const playerRadius = 10;
	camera.adjustZoomForPlayerSize(playerRadius);
	expect(camera.zoom).toBe(camera.maxZoom);
});

test('adjustZoomForPlayerSize sets zoom correctly for medium player', () => {
	const playerRadius = 30;
	camera.adjustZoomForPlayerSize(playerRadius);
	expect(camera.zoom).toBe(1);
});
