import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { initializeLanguageServices } from '@/components/Editor';
import { proxyTokenAtom } from '@/features/settings/atoms';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);
	const token = useAtomValue(proxyTokenAtom);

	useEffect(() => {
		(async () => {
			setReady(false);
			await initializeLanguageServices(
				`${import.meta.env.VITE_PYTHON_LSP_SERVER}/${token}/lsp/`,
			);
			setReady(true);
		})();
	}, [token]);

	return isMonacoReady;
};
