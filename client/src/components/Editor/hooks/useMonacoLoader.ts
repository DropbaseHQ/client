import { useEffect, useState } from 'react';
import { initializeLanguageServices } from '@/components/Editor';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(`${import.meta.env.VITE_PYTHON_LSP_SERVER}/lsp`);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, []);

	return isMonacoReady;
};
