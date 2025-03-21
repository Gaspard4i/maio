export class Camera {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.zoom = 0.5;
		this.minZoom = 0.1;
		this.maxZoom = 1.0;
	}

	adjustZoomForPlayerSize(playerRadius) {
		const basePlayerSize = 100;
		const zoomFactor = basePlayerSize / playerRadius;

		this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomFactor));

		return this.zoom;
	}

	adjustCameraPosition(player) {
		this.x = player.x;
		this.y = player.y;
		this.adjustZoomForPlayerSize(player.radius);
	}
}
