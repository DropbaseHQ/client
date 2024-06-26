import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { initializeLanguageServices, lspStatusAtom } from '@/components/Editor';
import { LSP_URL } from '@/utils/url';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);
	const setLspStatus = useSetAtom(lspStatusAtom);

	useEffect(() => {
		const setLspStatusTrue = () => setLspStatus(true);
		const setLspStatusFalse = () => setLspStatus(false);

		(async () => {
			setReady(false);
			try {
				await initializeLanguageServices({
					url: LSP_URL,
					onOpen: setLspStatusTrue,
					onClose: setLspStatusFalse,
				});
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, [LSP_URL, setLspStatus]);

	return isMonacoReady;
};
