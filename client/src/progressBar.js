/**
 * Module to manage the progress bar and score display
 */

// Maximum score for the progress bar
const MAX_SCORE = 1000;

// Keep track of the highest score achieved
let highestScore = 0;

/**
 * Update the progress bar based on player score
 * Only updates if the new score is higher than previous highest
 * @param {number} score - The player's current score
 */
export function updateProgressBar(score) {
	// Format score for display (with commas)
	const formattedScore = score.toLocaleString();

	// Only update if this score is higher than what we've seen
	if (score > highestScore) {
		highestScore = score;

		// Update the progress element width
		const progressElement = document.querySelector('.progress');
		const percentage = Math.min((score / MAX_SCORE) * 100, 100);
		progressElement.style.width = `${percentage}%`;

		// Update the score text
		const scoreTextElement = document.querySelector('.score-text');
		if (score > MAX_SCORE) {
			// When score exceeds MAX_SCORE, only show the player's score
			scoreTextElement.textContent = formattedScore;
		} else {
			// Otherwise show the score with the maximum value
			scoreTextElement.textContent = `${formattedScore} / ${MAX_SCORE.toLocaleString()}`;
		}
	}

	// Always update the in-game score display
	const scoreDisplay = document.querySelector('.score h2');
	if (scoreDisplay) {
		scoreDisplay.textContent = `Score: ${formattedScore}`;
	}
}
