import { initializeLanguageServices } from '@/components/Editor';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { useEffect, useState } from 'react';

export const useMonacoLoader = (): [
	boolean,
	WebSocket | undefined,
	MonacoLanguageClient | undefined,
] => {
	const [isMonacoReady, setReady] = useState(false);
	const [languageClient, setLanguageClient] = useState<MonacoLanguageClient | undefined>();

	let websocket: WebSocket | undefined;
	useEffect(() => {
		(async () => {
			setReady(false);
			let [ws, lc] = await initializeLanguageServices();
			websocket = ws;
			setLanguageClient(lc);
			setReady(true);
		})();
	}, []);

	return [isMonacoReady, websocket, languageClient];
};
