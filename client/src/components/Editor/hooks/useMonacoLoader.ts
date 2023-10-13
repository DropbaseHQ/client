import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			setReady(false);
			await initializeLanguageServices();
			setReady(true);
		})();
	}, []);

	return isMonacoReady;
};
