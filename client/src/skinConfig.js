async function parsePropFile(filePath) {
	const response = await fetch(filePath);
	const content = await response.text();
	const config = {};

	content.split('\n').forEach(line => {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) return;

		const [key, value] = trimmedLine.split('=').map(part => part.trim());
		if (!key || !value) return;

		const keys = key.split('.');
		let current = config;

		keys.forEach((k, index) => {
			if (index === keys.length - 1) {
				current[k] = value;
			} else {
				current[k] = current[k] || {};
				current = current[k];
			}
		});
	});

	return config;
}

export async function loadSkinConfig(skinId) {
	const propFilePath = `/skins/skin${skinId}.prop`;
	return await parsePropFile(propFilePath);
}
