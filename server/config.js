///////////////////CONFIGURATION DU SERVEUR///////////////////

export const PORT = 8080; // port du serv
export const TICK_RATE = 1000 / 60; // fq des ticks (FPS)

///////////////////CONFIGURATION DE LA MAP///////////////////

export const MAX_WIDTH = 12000; // Largeur
export const MAX_HEIGHT = 5000; // Hauteur
export const CHUNK_SIZE = 200; // taille des chunks

///////////////////CONFIGURATION DES JOUEURS///////////////////

export const DEFAULT_PLAYER = {
	radius: 30, // rayon de base (30)
	x: 6000, // pos x
	y: 3000, // pos y
	velocityX: 0, // vit initiale en X
	velocityY: 0, // vit initiale en Y
	isAccelerating: false,
};
export const BASE_PLAYER_SPEED = 14; // vit de base
export const ACCELERATED_SPEED = 2; // Vitesse en accélération
export const BONUS_TIME = 3000; // tps invincibilité au spawn (ms)
export const EAT_THRESHOLD = 1.05; // pourcentage de graille ( il faut être X% plus large pour manger un joueur)
export const ABSORB_AREA_THRESHOLD = 0.55; // pourcentage de l'air à absorber pour manger un joueur
export const PLAYER_EAT_BONUS = 1000; // bonus pour avoir graille un joueur
export const MAX_PLAYERS = 500; // Nombre maximum de joueurs

///////////////////CONFIGURATION DES TACHES///////////////////

export const NUM_STAINS = 1000; // nb de taches
export const STAIN_SIZE = 20; // taille des taches
export const STAIN_SCORE = 15; // bonus pour chaque tache mangée

///////////////////CONFIGURATION DES BONUS///////////////////

export const BONUS_STAIN_CHANCE = 0.05; // taux de tache bonus
export const BONUS_SIZE = 20; // taille des bonus
export const BONUS_SPEED_MULTIPLIER = 2; // multiplicateur de vitesse pour le bonus de vitesse
export const BONUS_SIZE_MULTIPLIER = 1.1; // multiplicateur de taille pour le bonus de taille

///////////////////CONFIGURATION DES BOTS///////////////////

export const NUM_BOTS = 50; // Nombre de bots initial
