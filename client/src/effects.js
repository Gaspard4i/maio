export function drawGrowthEffect(context, player) {
	const time = Date.now() / 100;
	const duration = 2000;
	const progress = (Date.now() % duration) / duration;
	const expansionFactor = 1 + 1.5 * (1 - progress * 2);
	const pulseEffect = 0.2 * Math.sin(time * 2);
	const baseRadius = player.radius;

	context.save();
	context.translate(player.x, player.y);

	const ringCount = 5;
	for (let i = 0; i < ringCount; i++) {
		const ringProgress = progress + i / ringCount;
		if (ringProgress > 1) continue;

		const ringSize =
			baseRadius * (1 + ringProgress * expansionFactor + pulseEffect);
		const ringOpacity = Math.max(0, 1 - ringProgress) * (1 - i / ringCount);

		context.beginPath();
		context.arc(0, 0, ringSize, 0, Math.PI * 2);
		context.strokeStyle = `hsla(${120 - ringProgress * 60}, 100%, ${50 + ringProgress * 50}%, ${ringOpacity})`;
		context.lineWidth = 3 + 5 * (1 - ringProgress);
		context.stroke();
	}

	const glowSize = baseRadius * 2;
	const glowOpacity = 0.6 * (1 - progress * 2);
	const glowGradient = context.createRadialGradient(0, 0, 0, 0, 0, glowSize);
	glowGradient.addColorStop(0, `rgba(255, 255, 150, ${glowOpacity * 1.5})`);
	glowGradient.addColorStop(0.5, `rgba(150, 255, 150, ${glowOpacity})`);
	glowGradient.addColorStop(1, 'rgba(100, 200, 100, 0)');

	context.fillStyle = glowGradient;
	context.beginPath();
	context.arc(0, 0, glowSize, 0, Math.PI * 2);
	context.fill();

	const particleCount = 20;
	for (let i = 0; i < particleCount; i++) {
		const angle = (i / particleCount) * Math.PI * 2 + time / 10;
		const distance = baseRadius * (0.5 + progress * 3);
		const x = Math.cos(angle) * distance;
		const y = Math.sin(angle) * distance;
		const particleSize = Math.max(
			0.2,
			3 * (1 - progress) + Math.sin(time + i) * 1.5
		);

		context.beginPath();
		context.arc(x, y, particleSize, 0, Math.PI * 2);
		context.fillStyle = `rgba(${200 + 55 * Math.sin(i)}, 255, ${100 + 155 * Math.cos(i)}, ${1 - progress})`;
		context.fill();
	}

	context.restore();
}

export function drawAccelerationEffect(context, player) {
	const time = Date.now() / 100;
	const angle = Math.atan2(player.vy, player.vx);
	const trailLength = player.radius * 4;
	const maxLineWidth = player.radius * 0.8;

	context.save();
	context.translate(player.x, player.y);
	context.rotate(angle + Math.PI);

	const linesCount = 15;
	for (let i = 0; i < linesCount; i++) {
		const lineOffset = (Math.random() * 2 - 1) * maxLineWidth;
		const lineLength = trailLength * (0.3 + Math.random() * 0.7);
		const lineWidth = 1 + Math.random() * 2;
		const alpha = 0.2 + Math.random() * 0.6;
		const colors = [
			'255, 255, 255',
			'135, 206, 250',
			'30, 144, 255',
			'0, 191, 255',
		];
		const color = `rgba(${colors[Math.floor(Math.random() * colors.length)]}, ${alpha})`;

		context.beginPath();
		context.moveTo(0, lineOffset);
		context.lineTo(
			lineLength,
			lineOffset + (Math.random() * 2 - 1) * (maxLineWidth / 4)
		);
		context.strokeStyle = color;
		context.lineWidth = lineWidth;
		context.stroke();
	}

	const flashSize = player.radius * 0.5;
	const flashOpacity = 0.5 + 0.3 * Math.sin(time * 3);
	const flashGradient = context.createRadialGradient(0, 0, 0, 0, 0, flashSize);
	flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashOpacity})`);
	flashGradient.addColorStop(0.5, `rgba(135, 206, 250, ${flashOpacity * 0.7})`);
	flashGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

	context.beginPath();
	context.arc(0, 0, flashSize, 0, Math.PI * 2);
	context.fillStyle = flashGradient;
	context.fill();

	const particleCount = 8;
	for (let i = 0; i < particleCount; i++) {
		const dist = Math.random() * trailLength * 0.8;
		const offsetY = (Math.random() * 2 - 1) * maxLineWidth * 0.6;

		context.save();
		context.translate(dist, offsetY);

		const particleAngle = Math.PI + (Math.random() * 0.2 - 0.1);
		context.rotate(particleAngle);

		context.beginPath();
		const stretchFactor = 3 + Math.random() * 5;
		const particleWidth = 1 + Math.random() * 1.5;
		const particleAlpha = 0.3 + 0.4 * Math.sin(time * 2 + i * 5);

		context.moveTo(-particleWidth * stretchFactor, 0);
		context.lineTo(particleWidth * stretchFactor, 0);
		context.lineWidth = particleWidth;
		context.strokeStyle = `rgba(255, 255, 255, ${particleAlpha})`;
		context.stroke();

		context.restore();
	}

	context.restore();
}

export function drawInvincibilityEffect(context, player) {
	const time = Date.now() / 100;
	const alpha = (Math.sin(time) + 1) / 2;
	const pulseScale = 1 + 0.05 * Math.sin(time * 2);

	context.save();
	context.translate(player.x, player.y);

	const starCount = 8;
	const starRadius = 3;
	for (let i = 0; i < starCount; i++) {
		const starAngle = (i / starCount) * Math.PI * 2 + time / 30;
		const distance = player.radius * 1.3;
		const x = Math.cos(starAngle) * distance;
		const y = Math.sin(starAngle) * distance;

		context.beginPath();
		context.arc(x, y, starRadius + 2 * Math.sin(time / 5 + i), 0, 2 * Math.PI);
		context.fillStyle = `rgba(220, 240, 255, ${Math.abs(Math.sin(time / 10 + i))})`;
		context.fill();
	}

	context.restore();
}

export function drawFireBoostEffect(context, player) {
	const time = Date.now() / 100;

	context.save();
	context.translate(player.x, player.y);

	const angle = Math.atan2(player.vy, player.vx);
	context.rotate(angle + Math.PI);

	const flameLength = player.radius * 3;
	const flameWidth = player.radius * 1.2;

	drawFireLayer(
		context,
		time,
		flameLength,
		flameWidth,
		[
			{ stop: 0, color: 'rgba(255, 255, 255, 0.95)' },
			{ stop: 0.1, color: 'rgba(255, 220, 50, 0.9)' },
			{ stop: 0.3, color: 'rgba(255, 140, 0, 0.8)' },
			{ stop: 0.6, color: 'rgba(255, 50, 0, 0.7)' },
			{ stop: 0.9, color: 'rgba(150, 0, 0, 0.3)' },
			{ stop: 1, color: 'rgba(100, 0, 0, 0)' },
		],
		12,
		0.6
	);

	drawFireLayer(
		context,
		time * 1.2,
		flameLength * 0.6,
		flameWidth * 0.5,
		[
			{ stop: 0, color: 'rgba(255, 255, 255, 0.95)' },
			{ stop: 0.2, color: 'rgba(255, 255, 200, 0.9)' },
			{ stop: 0.5, color: 'rgba(255, 220, 50, 0.8)' },
			{ stop: 0.8, color: 'rgba(255, 180, 0, 0.6)' },
			{ stop: 1, color: 'rgba(255, 140, 0, 0)' },
		],
		8,
		0.4
	);

	const sparkCount = 15;
	for (let i = 0; i < sparkCount; i++) {
		const sparkLife = (Math.sin(time / 2 + i * 8) + 1) / 2;
		const sparkDistance = flameLength * (0.3 + sparkLife * 0.7);

		const offsetX = sparkDistance * (0.7 + 0.3 * Math.cos(time + i * 3));
		const offsetY =
			flameWidth * 0.7 * (Math.sin(time * 2 + i * 5) - 0.5) * sparkLife;

		const sparkSize = 2 + 2 * Math.random() * (1 - sparkLife);

		context.beginPath();
		context.arc(offsetX, offsetY, sparkSize, 0, Math.PI * 2);

		const sparkColor =
			sparkLife > 0.6
				? `rgba(255, 255, ${200 + 55 * Math.sin(i * 50)}, ${0.9 * (1 - sparkLife)})`
				: `rgba(255, ${100 + 155 * sparkLife}, 0, ${0.8 * (1 - sparkLife)})`;

		context.fillStyle = sparkColor;
		context.fill();
	}

	const smokeCount = 6;
	for (let i = 0; i < smokeCount; i++) {
		const smokeLife = (Math.sin(time / 3 + i * 7) + 1) / 2;
		const smokeDistance = flameLength * (0.8 + smokeLife * 0.4);

		const offsetX = smokeDistance * (0.8 + 0.2 * Math.cos(time / 2 + i * 4));
		const offsetY =
			flameWidth * (Math.sin(time + i * 5) - 0.5) * smokeLife * 0.8;

		const smokeSize = 5 + 10 * Math.random() * smokeLife;
		const smokeOpacity = 0.3 * (1 - smokeLife);

		context.beginPath();
		context.arc(offsetX, offsetY, smokeSize, 0, Math.PI * 2);
		context.fillStyle = `rgba(40, 40, 40, ${smokeOpacity})`;
		context.fill();
	}

	const heatSize = player.radius * 1.2;
	const heatGradient = context.createRadialGradient(0, 0, 0, 0, 0, heatSize);

	heatGradient.addColorStop(0, 'rgba(255, 180, 50, 0.4)');
	heatGradient.addColorStop(0.5, 'rgba(255, 100, 20, 0.25)');
	heatGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

	context.beginPath();
	context.arc(0, 0, heatSize, 0, Math.PI * 2);
	context.fillStyle = heatGradient;
	context.fill();

	context.restore();
}

export function drawFireLayer(
	context,
	time,
	length,
	width,
	colorStops,
	turbulence,
	amplitude
) {
	context.beginPath();

	const points = [];
	const steps = 15;

	for (let i = 0; i <= steps; i++) {
		const progress = i / steps;
		const x = progress * length;
		const turbFactor = progress * turbulence;
		const freq = 3 + progress * 5;
		const turbY = Math.sin(time * 2 + progress * 10) * turbFactor;
		const widthAtPoint =
			width * amplitude * Math.sin(progress * Math.PI) * (1 - progress * 0.3);

		points.push({
			x: x,
			y: -widthAtPoint + turbY,
		});
	}

	for (let i = steps; i >= 0; i--) {
		const progress = i / steps;
		const x = progress * length;
		const turbFactor = progress * turbulence;
		const turbY = -Math.sin(time * 2 + progress * 10 + Math.PI) * turbFactor;
		const widthAtPoint =
			width * amplitude * Math.sin(progress * Math.PI) * (1 - progress * 0.3);

		points.push({
			x: x,
			y: widthAtPoint + turbY,
		});
	}

	context.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		context.lineTo(points[i].x, points[i].y);
	}

	context.closePath();

	const gradient = context.createLinearGradient(0, 0, length, 0);

	colorStops.forEach(stop => {
		gradient.addColorStop(stop.stop, stop.color);
	});

	context.fillStyle = gradient;
	context.fill();
}
