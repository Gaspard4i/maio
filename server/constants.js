export const PORT = 8080; // port serv base (8080)

export const NUM_BOTS = 50; // nb de bots base (50)
export const NUM_STAINS = 1500; // nb de taches base (1500)
export const CHUNK_SIZE = 200; // taille des chunks (200)

export const MAX_WIDTH = 12000; // largeur de la map (10000)
export const MAX_HEIGHT = 6000; // hauteur de la map (5000)

export const DEFAULT_PLAYER = {
	radius: 30, // rayon du joueur base (30)
	x: 6000, // pos x base (6000)
	y: 3000, // pos y base (3000)
	velocityX: 0, // vitesse x base (0)
	velocityY: 0, // viteese y base (0)
	isAccelerating: false,
};

export const BASE_PLAYER_SPEED = 10; // vitesse de base base (10)
export const ACCELERATED_SPEED = 15; // vitesse accélérée base (15)
export const FRICTION = 0.9; // slide coef base (0.9)

export const TICK_RATE = 1000 / 60; // fps ou hz base (1000/60)
