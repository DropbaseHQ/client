import {
	Button,
	Center,
	FormControl,
	FormErrorMessage,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
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
import { Zap } from 'react-feather';

// TODO: move to a place where it can be reused
const GradientIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#06f', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#3ccf91', stopOpacity: 1 }} />
			</linearGradient>
		</defs>
		<Zap stroke="url(#gradient1)" />
	</svg>
);

export const PromptModal = () => {
	const toast = useToast();
	const { pageName, appName } = useParams();

	const queryClient = useQueryClient();
	const [promptError, setPromptError] = useState('');

	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const [updatedCode, setUpdatedCode] = useState({
		code: '',
		prompt: '',
	});

	const methods = useForm();

	const { watch } = methods;
	const prompt = watch('prompt');

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
			if (data.type === 'ui') {
				toast({
					status: 'success',
					title: 'Updated UI',
				});
				handleCloseModal(true);
				queryClient.invalidateQueries(PAGE_FILE_QUERY_KEY);
			} else if (data.type === 'logic') {
				setUpdatedCode({ code: data.message, prompt });
			} else {
				setPromptError(data.message);
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
			});
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

	// TODO: move to css to reuse
	const gradientStyle = {
		background: 'linear-gradient(90deg, #06f, #3ccf91)',
		WebkitBackgroundClip: 'text',
		color: 'transparent',
		size: 'sm',
		marginLeft: '.3em',
	};

	return (
		<Modal size="6xl" isOpen={isOpen} onClose={handleCloseModal}>
			<ModalOverlay />
			<ModalContent minW={updatedCode.prompt && updatedCode.code ? '80%' : '10%'}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormProvider {...methods}>
						<ModalHeader borderBottomWidth="1px">
							<Stack spacing="0" direction="row">
								<Center>
									<GradientIcon />
									<h3 style={gradientStyle}>AI Dev Prompt</h3>
								</Center>
							</Stack>
						</ModalHeader>
						<ModalBody p="0">
							<Stack p="6" spacing="4">
								<Stack spacing="4">
									<FormControl isInvalid={!!promptError}>
										<FormInput
											autoFocus
											id="prompt"
											onKeyDown={handleKeyDown}
											type="textarea"
										/>
										<FormErrorMessage>{promptError}</FormErrorMessage>
									</FormControl>
								</Stack>

								{updatedCode.prompt && updatedCode.code ? (
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
									{updatedCode.code &&
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
											{updatedCode.prompt && updatedCode.prompt !== prompt
												? 'Regenerate Code'
												: 'Generate Code'}
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
