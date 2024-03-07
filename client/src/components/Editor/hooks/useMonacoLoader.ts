import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';
import { useGetLSPURL } from '@/features/authorization/hooks/useLogin';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);
	const lspURL = useGetLSPURL();

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(lspURL);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, [lspURL]);

	return isMonacoReady;
};
