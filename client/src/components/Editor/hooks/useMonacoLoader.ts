import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { initializeLanguageServices } from '@/components/Editor';
import { proxyTokenAtom } from '@/features/settings/atoms';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);
	const proxyToken = useAtomValue(proxyTokenAtom);

	useEffect(() => {
		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices(
					`${import.meta.env.VITE_PYTHON_LSP_SERVER}/lsp`,
					proxyToken,
				);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, [proxyToken]);

	return isMonacoReady;
};
