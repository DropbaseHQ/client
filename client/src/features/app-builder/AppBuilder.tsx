import { PropsWithChildren, useEffect, useRef } from 'react';
import { Box, Center, CenterProps, Stack } from '@chakra-ui/react';

import { MoreHorizontal, MoreVertical } from 'react-feather';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import 'monaco-editor/esm/vs/editor/edcore.main';

import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, initServices } from 'monaco-languageclient';
import { Uri, languages, editor as monacoEditor } from 'monaco-editor';
import {
	createModelReference,
	createConfiguredEditor,
	IReference,
	ITextFileEditorModel,
} from 'vscode/monaco';

import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Table } from '@/features/smart-table/components/Table';

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
	return new MonacoLanguageClient({
		name: 'Python Language Client',
		clientOptions: {
			// use a language id as a document selector
			documentSelector: ['python'],
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

export type ExamplePythonEditor = {
	languageId: string;
	editor: monacoEditor.IStandaloneCodeEditor;
	uri: Uri;
	modelRef: IReference<ITextFileEditorModel>;
};

const createPythonEditor = async (config: {
	htmlElement: HTMLElement;
	content: string;
	init: boolean;
	filepath: string;
}) => {
	const languageId = 'python';

	if (config.init === true) {
		await initServices({
			enableThemeService: true,
			// enableThemeService: false,
			enableTextmateService: true,
			enableModelService: true,
			configureEditorOrViewsServiceConfig: {
				enableViewsService: false,
			},
			enableLanguagesService: true,
			enableKeybindingsService: true,
			enableQuickaccessService: true,
			debugLogging: true,
		});
	}

	// register the JSON language with Monaco
	languages.register({
		id: languageId,
		extensions: ['.py'],
		aliases: ['Python', 'Python3'],
		mimetypes: ['application/text'],
	});

	// create the model
	const uri = Uri.parse(config.filepath);
	// const uri = Uri.parse(`file:///tmp/${config.filename}`);
	const modelRef = await createModelReference(uri, config.content);
	modelRef.object.setLanguageId(languageId);

	// create monaco editor
	const editor = createConfiguredEditor(config.htmlElement, {
		model: modelRef.object.textEditorModel,
		glyphMargin: true,
		lightbulb: {
			enabled: true,
		},
		automaticLayout: true,
		theme: 'vs-dark',
		language: languageId,
	});

	const result = {
		languageId,
		editor,
		uri,
		modelRef,
	} as ExamplePythonEditor;
	return Promise.resolve(result);
};

let init = true;

export const ReactMonacoEditor = () => {
	const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>();
	const ref = useRef<any>();
	const ref2 = useRef<any>();
	const url = 'https://0baa-65-95-84-67.ngrok-free.app';
	const lspWebSocket: any = useRef(null);

	useEffect(() => {
		const currentEditor = editorRef.current;

		if (ref.current != null) {
			const start = async () => {
				await createPythonEditor({
					htmlElement: ref.current!,
					content: ['# fetcher/<uuid>.py'].join('\n'),
					filepath: 'fetcher/b518b883-fc3d-4fc2-a2be-f6e0a8dacd76.py',
					init,
				});
				if (init) {
					init = false;

					await createPythonEditor({
						htmlElement: ref2.current!,
						content: ['# ui-component.py'].join('\n'),
						filepath: 'ui-component.py',
						init,
					});

					lspWebSocket.current = createWebSocket(url);
				}
			};
			start();

			return () => {
				currentEditor?.dispose();
			};
		}

		window.onbeforeunload = () => {
			// On page reload/exit, close web socket connection
			lspWebSocket?.current?.close();
		};
		return () => {
			// On component unmount, close web socket connection
			lspWebSocket?.current?.close();
		};
	}, []);

	return (
		<>
			<div ref={ref} style={{ height: '50vh' }} />
			<div ref={ref2} style={{ height: '50vh' }} />
		</>
	);
};

const PanelHandleContainer = ({ children, ...props }: PropsWithChildren<CenterProps>) => {
	return (
		<PanelResizeHandle>
			<Center
				_hover={{
					borderColor: 'gray.200',
					boxShadow: '0px 2px 5px rgba(0,0,0,.1) inset',
				}}
				{...props}
			>
				{children}
			</Center>
		</PanelResizeHandle>
	);
};

export const AppBuilder = () => {
	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={80}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								{/* Replace with state component  */}
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									State
								</Box>
							</Panel>

							<PanelHandleContainer
								borderLeftWidth="1px"
								borderRightWidth="1px"
								h="full"
							>
								<MoreVertical size="16" />
							</PanelHandleContainer>

							<Panel>
								<ReactMonacoEditor />

								{/* Replace with Fetchers component  */}
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									Fetchers
								</Box>
							</Panel>

							<PanelHandleContainer
								borderLeftWidth="1px"
								borderRightWidth="1px"
								h="full"
							>
								<MoreVertical size="16" />
							</PanelHandleContainer>

							<Panel defaultSize={20}>
								{/* Replace with UI component  */}
								<Box bg="gray.50" p="6" h="full">
									UI Code
								</Box>
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandleContainer borderTopWidth="1px" borderBottomWidth="1px" w="full">
						<MoreHorizontal size="16" />
					</PanelHandleContainer>

					<Panel>
						<Table />
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
