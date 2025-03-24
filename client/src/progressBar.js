/**
 * Module to manage the progress bar and score display
 */

// Keep track of the highest score achieved
let highestScore = 0;

/**
 * Update the progress bar based on player score
 * Only updates if the new score is higher than previous highest
 * @param {number} score - The player's current score
 * @param {Array} leaderboard - The current leaderboard data
 */
export function updateProgressBar(score, leaderboard = []) {
	// Format score for display (with commas)
	const formattedScore = score.toLocaleString();

	// Determine if we have a MAX_SCORE from leaderboard
	let MAX_SCORE = 0;
	let hasMaxScore = false;

	// If leaderboard has entries, use best score as MAX_SCORE
	if (leaderboard && leaderboard.length > 0) {
		// The leaderboard is already sorted, so the first entry has the highest score
		MAX_SCORE = leaderboard[0]?.score || 0;
		hasMaxScore = MAX_SCORE > 0;
	}

	// Only update if this score is higher than what we've seen
	if (score > highestScore) {
		highestScore = score;

		// Update the progress element width
		const progressElement = document.querySelector('.progress');

		if (hasMaxScore) {
			// If we have a MAX_SCORE, calculate percentage
			const percentage = Math.min((score / MAX_SCORE) * 100, 100);
			progressElement.style.width = `${percentage}%`;
		} else {
			// Without MAX_SCORE, progress bar is always 100%
			progressElement.style.width = '100%';
		}

		// Update the score text
		const scoreTextElement = document.querySelector('.score-text');
		if (!hasMaxScore || score >= MAX_SCORE) {
			// When no MAX_SCORE or score exceeds MAX_SCORE, only show the player's score
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
