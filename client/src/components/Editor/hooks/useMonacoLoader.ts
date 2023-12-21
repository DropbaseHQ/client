import { useEffect, useState } from 'react';
import { initializeLanguageServices, createLSPWebSocket } from '@/components/Editor';

export const useMonacoLoader = () => {
	const [isMonacoReady, setMonacoReady] = useState(false);
	const [isLSPReady, setLSPReady] = useState(false);

	useEffect(() => {
		(async () => {
			setMonacoReady(false);
			try {
				await initializeLanguageServices();
				createLSPWebSocket(`${import.meta.env.VITE_PYTHON_LSP_SERVER}/lsp`, setLSPReady);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setMonacoReady(true);
			}
		})();
	}, []);

	return {isMonacoReady, isLSPReady};
};
