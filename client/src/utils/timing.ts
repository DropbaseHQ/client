export const getDelayInterval = (count: number) => {
	if (count === 0) {
		return 0;
	}

	if (count < 5) {
		return 1;
	}

	if (count < 10) {
		return 3;
	}

	if (count < 15) {
		return 5;
	}

	if (count < 20) {
		return 10;
	}

	return 30;
};
export const wait = (interval: number): Promise<void> => {
	return new Promise((resolve) => {
		const timeoutId = setTimeout(() => {
			resolve();
			clearTimeout(timeoutId);
		}, interval);
	});
};
