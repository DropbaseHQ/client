import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';
import { getLSPURL } from '@/utils/url';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(getLSPURL());
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, []);

	return isMonacoReady;
};
