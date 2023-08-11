import * as monaco from 'monaco-editor';
import { initServices, MonacoLanguageClient } from 'monaco-languageclient';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createModelReference, createConfiguredEditor } from 'vscode/monaco'
import { createRef, useEffect } from 'react';
import { language, conf } from 'monaco-editor/esm/vs/basic-languages/python/python';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);

const languageId = 'python';

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
	return new MonacoLanguageClient({
		name: 'Python Language Client',
		clientOptions: {
			// use a language id as a document selector
			documentSelector: [languageId],
			// disable the default error handler
			errorHandler: {
				error: () => ({ action: ErrorAction.Continue }),
				closed: () => ({ action: CloseAction.DoNotRestart })
			}
		},
		// create a language client connection from the JSON RPC connection on demand
		connectionProvider: {
			get: () => {
				return Promise.resolve(transports);
			}
		}
	});
};

export const createWebSocket = (url: string): WebSocket => {
	const webSocket = new WebSocket(url);
	webSocket.onopen = () => {
		const socket = toSocket(webSocket);
		const reader = new WebSocketMessageReader(socket);
		const writer = new WebSocketMessageWriter(socket);
		const languageClient = createLanguageClient({
			reader,
			writer
		});
		languageClient.start();
		reader.onClose(() => languageClient.stop());
	};
	return webSocket;
};

let initializedServices = false;
const initializeLanguageServices = async (websocketUrl: string) => {
	if (initializedServices) {
		return;
	}
	await initServices({
		// Use our own themes
		enableThemeService: false,
		enableTextmateService: false,

		enableFilesService: true,
		enableModelService: true,
		enableLanguagesService: true,
		enableKeybindingsService: true,
		enableQuickaccessService: true,

		// Disable for production
		debugLogging: true,
	});

	// Register the Python language with Monaco
	monaco.languages.register({
		id: languageId,
		extensions: ['.py'],
		aliases: ['Python', 'Python3'],
		mimetypes: ['application/text']
	});
	monaco.languages.setLanguageConfiguration(languageId, conf);
	monaco.languages.setMonarchTokensProvider(languageId, language);


	const lspWebSocket: WebSocket = createWebSocket(websocketUrl);
	initializedServices = true;

	return lspWebSocket;
}

export const createPythonEditor = async (config: {
	htmlElement: HTMLElement,
	content?: string,
	filepath: string,
	theme?: string,
}) => {
	// Create the model
	const uri = monaco.Uri.parse(config.filepath);
	const modelRef = await createModelReference(uri, config.content);
	modelRef.object.setLanguageId(languageId);

	// Create monaco editor
	createConfiguredEditor(config.htmlElement, {
		model: modelRef.object.textEditorModel,
		glyphMargin: true,
		lightbulb: {
			enabled: true
		},
		automaticLayout: true,
		theme: config.theme,
		language: languageId,
	});
};


export type EditorProps = {
	defaultCode?: string;
	filepath: string;
	theme?: string;
	style?: React.CSSProperties;
}

export const PythonEditor = ({ defaultCode, filepath, theme, style }: EditorProps) => {
	const ref = createRef<HTMLDivElement>();

	// TODO: use env
	const url = 'ws://localhost:8000';

	useEffect(() => {
		if (ref.current == null) {
			return;
		}

		(async () => {
			const lspWebSocket = await initializeLanguageServices(url);
			window.onbeforeunload = () => {
				// On page reload/exit, close web socket connection
				lspWebSocket?.close();
			};

			createPythonEditor({
				htmlElement: ref.current!,
				content: defaultCode,
				filepath: filepath,
				theme,
			})
		})();
	}, [ref]);

	return (
		<div
			ref={ref}
			style={style}
		/>
	);
};
