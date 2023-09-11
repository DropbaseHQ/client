export const logBuilder = (data: any) => {
	let outputPreview = '';

	if (data?.stdout && data.stdout !== '\n') {
		outputPreview = data.stdout;
	}

	if (data?.traceback) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += `---------------------------------------------------------------------------------\n`;

		outputPreview += data.traceback;
	}

	if (data?.status === 'error' && data?.result) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += data.result;
	}

	return outputPreview;
};
