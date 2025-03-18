export const camera = {
	x: 0,
	y: 0,
	zoom: 0.5,
	minZoom: 0.1,
	maxZoom: 1.0,
	
	adjustZoomForPlayerSize(playerRadius) {
	  const basePlayerSize = 30; 
	  const zoomFactor = basePlayerSize / playerRadius;
	  
	  this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomFactor));
	  
	  
	  return this.zoom;
	}
  };