import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(`http://${window.location.hostname}:9095/lsp`);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, []);

	return isMonacoReady;
};
