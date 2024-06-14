import {
	Button,
	ButtonGroup,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import * as monacoLib from 'monaco-editor';

import { useQueryClient } from 'react-query';
import { DiffEditor as MonacoDiffEditor, useMonaco } from '@monaco-editor/react';

import { useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtom } from 'jotai';
import { promptAtom } from '@/features/ai/atoms';
import { FormInput } from '@/components/FormInput';
import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { PAGE_FILE_QUERY_KEY, useFile, useSaveCode } from '@/features/app-builder/hooks';
import { useSubmitPrompt } from '@/features/ai/hooks';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';

export const PromptModal = () => {
	const toast = useToast();
	const { pageName, appName } = useParams();

	const queryClient = useQueryClient();

	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const [tabIndex, setTabIndex] = useState(0);
	const [updatedCode, setUpdatedCode] = useState({
		code: '',
		prompt: '',
	});

	const methods = useForm();

	const { watch } = methods;
	const prompt = watch('prompt');

	const isUIPrompt = tabIndex === 0;

	const [{ isOpen }, setPromptMeta] = useAtom(promptAtom);

	const { code: originalCode, refetch } = useFile({
		pageName,
		appName,
		fileName: 'main.py',
	});

	const handleCloseModal = (reset?: any) => {
		setPromptMeta({
			isOpen: false,
		});

		if (reset) {
			setUpdatedCode({
				code: '',
				prompt: '',
			});

			methods.reset({
				action: '',
				prompt: '',
			});
		}
	};

	const savePythonMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated code',
			});
			refetch();
			queryClient.invalidateQueries(PAGE_FILE_QUERY_KEY);
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			handleCloseModal();
			setUpdatedCode((old) => ({ ...old, code: '' }));
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update code',
				description: getErrorMessage(error),
			});
		},
	});

	const mutation = useSubmitPrompt({
		onSuccess: (data: any) => {
			if (isUIPrompt) {
				toast({
					status: 'success',
					title: 'Updated UI',
				});
			} else {
				setUpdatedCode({ code: data, prompt });
			}
		},
	});

	const onSaveFile = (newCode?: any) => {
		savePythonMutation.mutate({
			pageName,
			appName,
			fileName: 'main',
			code: newCode || updatedCode.code,
			fileType: 'python',
			depends: [],
		});
	};

	const onSubmit = async () => {
		try {
			await mutation.mutateAsync({
				prompt,
				appName,
				pageName,
				type: isUIPrompt ? 'ui' : 'function',
			});

			if (isUIPrompt) {
				handleCloseModal(true);
				queryClient.invalidateQueries(PAGE_FILE_QUERY_KEY);
			}
		} catch (e) {
			//
		}
	};

	const handleKeyDown = (e: any) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			onSubmit();
		}
	};

	const handleEditorDidMount = (editor: any): any => {
		const ed = editor.getModel().modified;
		ed.onDidChangeContent(() => {
			setUpdatedCode((old) => ({
				...old,
				code: ed.getValue(),
			}));
		});

		// eslint-disable-next-line
		editor.addCommand(monacoLib.KeyMod.CtrlCmd | monacoLib.KeyCode.Enter, () => {
			onSaveFile(ed.getValue());
		});
	};

	useHotkeys('ctrl+enter, meta+enter', onSubmit);

	return (
		<Modal size="6xl" isOpen={isOpen} onClose={handleCloseModal}>
			<ModalOverlay />
			<ModalContent minW={updatedCode.prompt && updatedCode.code && !isUIPrompt ? "80%" : "10%"}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormProvider {...methods}>
						<ModalHeader borderBottomWidth="1px">
							<Stack spacing="0">
								<Text fontSize="xl">Generate code</Text>
							</Stack>
						</ModalHeader>
						<ModalBody p="0">
							<Stack p="6" spacing="4">
								<ButtonGroup isAttached size="sm" variant="outline">
									<Button
										onClick={() => {
											setTabIndex(0);
										}}
										variant={isUIPrompt ? 'solid' : 'outline'}
									>
										UI
									</Button>
									<Button
										onClick={() => {
											setTabIndex(1);
										}}
										variant={!isUIPrompt ? 'solid' : 'outline'}
									>
										Function
									</Button>
								</ButtonGroup>

								<Stack spacing="4">
									<FormInput
										autoFocus
										name="Write prompt"
										id="prompt"
										onKeyDown={handleKeyDown}
										type="textarea"
									/>
								</Stack>

								{updatedCode.prompt && updatedCode.code && !isUIPrompt ? (
									<MonacoDiffEditor
										height="400px"
										original={originalCode}
										modified={updatedCode.code}
										language="python"
										onMount={handleEditorDidMount}
										options={{
											lineNumbers: 'off',

											glyphMargin: false,
											lightbulb: {
												enabled: true,
											},
											overviewRulerBorder: false,
											overviewRulerLanes: 0,
											automaticLayout: true,
											scrollBeyondLastLine: false,
											minimap: {
												enabled: false,
											},
											fontFamily: 'Fira Code',
											fontSize: 12,
											scrollbar: {
												verticalHasArrows: true,
												alwaysConsumeMouseWheel: false,
												vertical: 'auto',
												horizontal: 'auto',
											},
										}}
									/>
								) : null}
							</Stack>
							<ModalFooter mt="2" borderTopWidth="1px" px="6">
								<Stack direction="row">
									{!isUIPrompt &&
									updatedCode.code &&
									updatedCode.prompt &&
									updatedCode.prompt === prompt ? (
										<Button
											size="sm"
											isLoading={savePythonMutation.isLoading}
											colorScheme="blue"
											onClick={() => onSaveFile()}
										>
											Approve Changes
										</Button>
									) : (
										<Button
											isDisabled={!prompt}
											size="sm"
											isLoading={mutation.isLoading}
											colorScheme="blue"
											type="submit"
										>
											{!isUIPrompt &&
											updatedCode.prompt &&
											updatedCode.prompt !== prompt
												? 'Regenerate'
												: 'Generate'}
										</Button>
									)}
								</Stack>
							</ModalFooter>
						</ModalBody>
					</FormProvider>
				</form>
			</ModalContent>
		</Modal>
	);
};
