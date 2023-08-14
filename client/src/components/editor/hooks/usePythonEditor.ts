import * as monaco from 'monaco-editor';
import { initServices, MonacoLanguageClient } from 'monaco-languageclient';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createModelReference, createConfiguredEditor } from 'vscode/monaco';
import { createRef, useEffect, useRef, useState } from 'react';
import { language, conf } from 'monaco-editor/esm/vs/basic-languages/python/python';
import { buildWorkerDefinition } from 'monaco-editor-workers';

import { useMonacoTheme } from './useMonacoTheme';

buildWorkerDefinition(
	'../../../../node_modules/monaco-editor-workers/dist/workers/',
	new URL('', window.location.href).href,
	false,
);

const languageId = 'python';

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
	return new MonacoLanguageClient({
		name: 'Python Language Client',
		clientOptions: {
			// use a language id as a document selector
			documentSelector: [languageId],
			// disable the default error handler
			errorHandler: {
				error: () => ({ action: ErrorAction.Continue }),
				closed: () => ({ action: CloseAction.DoNotRestart }),
			},
		},
		// create a language client connection from the JSON RPC connection on demand
		connectionProvider: {
			get: () => {
				return Promise.resolve(transports);
			},
		},
	});
};

const createWebSocket = (url: string): WebSocket => {
	const webSocket = new WebSocket(url);
	webSocket.onopen = () => {
		const socket = toSocket(webSocket);
		const reader = new WebSocketMessageReader(socket);
		const writer = new WebSocketMessageWriter(socket);
		const languageClient = createLanguageClient({
			reader,
			writer,
		});
		languageClient.start();
		reader.onClose(() => languageClient.stop());
	};
	return webSocket;
};

export const initializeLanguageServices = async () => {
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
		debugLogging: false,
	});

	// Register the Python language with Monaco
	monaco.languages.register({
		id: languageId,
		extensions: ['.py'],
		aliases: ['Python', 'Python3'],
		mimetypes: ['application/text'],
	});

	monaco.languages.setLanguageConfiguration(languageId, conf);
	monaco.languages.setMonarchTokensProvider(languageId, language);

	return createWebSocket(import.meta.env.VITE_PYTHON_LSP_SERVER);
};

const createPythonEditor = async (config: { htmlElement: HTMLElement; filepath: string }) => {
	// Create the model
	const uri = monaco.Uri.parse(config.filepath);
	const modelRef = await createModelReference(uri, '');
	modelRef.object.setLanguageId(languageId);

	// Create monaco editor
	const editor = createConfiguredEditor(config.htmlElement, {
		model: modelRef.object.textEditorModel,
		glyphMargin: false,
		lightbulb: {
			enabled: true,
		},
		automaticLayout: true,
		language: languageId,
	});

	return editor;
};

export type EditorProps = {
	code?: string;
	filepath: string;
	onChange: (value: string) => void;
};

export const usePythonEditor = ({ code, filepath, onChange }: EditorProps) => {
	const [isEditorReady, setEditorReady] = useState(false);

	const creatingRef = useRef(false);
	const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const ref = createRef<HTMLDivElement>();

	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useMonacoTheme(monaco);

	useEffect(() => {
		const createEditor = async () => {
			if (!editorInstanceRef.current && !creatingRef.current) {
				creatingRef.current = true;

				editorInstanceRef.current = await createPythonEditor({
					htmlElement: ref.current!,
					filepath,
				});

				creatingRef.current = false;

				if (editorInstanceRef.current) {
					setEditorReady(true);
				}
			}
		};

		if (ref.current) {
			createEditor();
		}

		return () => {
			if (editorInstanceRef.current) {
				editorInstanceRef.current?.dispose();
				editorInstanceRef.current = null;
				setEditorReady(false);
			}
		};
	}, [ref, filepath]);

	useEffect(() => {
		if (isEditorReady && editorInstanceRef.current && onChangeRef.current) {
			const editorInstance = editorInstanceRef.current;
			editorInstance.onDidChangeModelContent(() => {
				onChangeRef.current(editorInstance.getValue());
			});
		}
	}, [onChangeRef, isEditorReady, filepath, editorInstanceRef]);

	useEffect(() => {
		if (editorInstanceRef.current && isEditorReady) {
			const editorInstance = editorInstanceRef.current;
			if (editorInstance.getValue() !== code) {
				editorInstance.setValue(code || '');
			}
		}
	}, [code, isEditorReady, editorInstanceRef]);

	return ref;
};
