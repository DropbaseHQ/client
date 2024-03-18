import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { initializeLanguageServices, lspStatusAtom } from '@/components/Editor';
import { useGetLSPURL } from '@/features/authorization/hooks/useLogin';

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
				await initializeLanguageServices(lspURL, setLspStatusTrue, setLspStatusFalse);
			} catch (e) {
				// TODO: add error handling
			} finally {
				setReady(true);
			}
		})();
	}, [lspURL, setLspStatus]);

	return isMonacoReady;
};
