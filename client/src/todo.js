export function startGame() {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);

	setInterval(movePlayer, 1000 / 60);

	observeCanvas(draw, render);
}

window.startGame = startGame;

document.addEventListener('DOMContentLoaded', () => {
	const playButton = document.getElementById('play-button');
	playButton.addEventListener('click', () => {
		document.body.style.overflow = 'hidden';
		document.getElementById('home-header').style.display = 'none';
		document.getElementById('home-main').style.display = 'none';
		document.getElementById('home-footer').style.display = 'none';
		const canvas = document.getElementById('game-canvas');
		canvas.classList.remove('hidden');
		canvas.style.display = 'block';
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		// Démarrer le jeu après avoir appuyé sur "PLAY"
		window.startGame();
	});
});
