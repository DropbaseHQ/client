import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';

export const useMonacoLoader = (setLSPReady: (value: boolean) => void) => {
	const [isMonacoReady, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(
					`${import.meta.env.VITE_PYTHON_LSP_SERVER}/lsp`,
					setLSPReady,
				);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, []);

	return isMonacoReady;
};
