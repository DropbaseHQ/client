import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { initializeLanguageServices } from '@/components/Editor';
import { useGetLSPURL } from '@/features/authorization/hooks/useLogin';
import { lspStatusAtom } from '@/features/app/atoms';

export const useMonacoLoader = () => {
	const [isMonacoReady, setReady] = useState(false);
	const lspURL = useGetLSPURL();
	const setLspStatus = useSetAtom(lspStatusAtom);

	useEffect(() => {
		const setLspStatusTrue = () => setLspStatus(true);
		const setLspStatusFalse = () => setLspStatus(false);

		(async () => {
			setReady(false);
			try {
				const ws = await initializeLanguageServices(lspURL);
				ws.addEventListener('open', setLspStatusTrue);
				ws.addEventListener('close', setLspStatusFalse);
				ws.addEventListener('error', setLspStatusFalse);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, [lspURL, setLspStatus]);

	return isMonacoReady;
};
