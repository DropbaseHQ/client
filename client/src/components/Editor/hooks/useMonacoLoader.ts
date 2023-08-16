import { initializeLanguageServices } from '@/components/Editor';
import { useEffect, useState } from 'react';

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
