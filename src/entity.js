export class Entity {
	constructor(radius, x, y, vx, vy) {
		if (this.constructor === Entity) {
			throw new Error("Impossible d'instancier la classe abstraite Entity");
		}
		this.radius = radius;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}

	draw(context) {
		throw new Error("La méthode 'draw()' doit être implémentée.");
	}
}
