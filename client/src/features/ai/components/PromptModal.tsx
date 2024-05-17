import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { DiffEditor as MonacoDiffEditor, useMonaco } from '@monaco-editor/react';

import { useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtom } from 'jotai';
import { promptAtom } from '@/features/ai/atoms';
import { FormInput } from '@/components/FormInput';
import { ACTIONS } from '@/constant';
import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { useFile, useSaveCode } from '@/features/app-builder/hooks';
import { useSubmitPrompt } from '@/features/ai/hooks';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';

export const PromptModal = () => {
	const toast = useToast();
	const { pageName, appName } = useParams();

	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const [tabIndex, setTabIndex] = useState(0);
	const [updatedCode, setUpdatedCode] = useState('');

	const [{ resource, name, block }, setPromptMeta] = useAtom(promptAtom);

	const isUIPrompt = resource === 'ui';

	const { code: originalCode, refetch } = useFile({
		pageName,
		appName,
		fileName: 'main.py',
	});

	const savePythonMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated code',
			});
			refetch();
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
				setUpdatedCode(data);
			}
		},
	});

	const methods = useForm();

	const { watch } = methods;
	const prompt = watch('prompt');

	const handleCloseModal = () => {
		setPromptMeta({
			name: null,
			resource: null,
			block: null,
		});
	};

	const events = useMemo(() => {
		if (resource === 'table') {
			return [
				{
					name: ACTIONS.GET_DATA,
					value: ACTIONS.GET_DATA,
				},
			];
		}

		if (name?.startsWith?.('input')) {
			return [
				{
					name: ACTIONS.CHANGE,
					value: ACTIONS.CHANGE,
				},
			];
		}
		if (name?.startsWith?.('button')) {
			return [
				{
					name: ACTIONS.CLICK,
					value: ACTIONS.CLICK,
				},
			];
		}

		return [];
	}, [resource, name]);

	const onSubmit = async (formValues: any) => {
		try {
			if (tabIndex === 1 && !isUIPrompt) {
				savePythonMutation.mutate({
					pageName,
					appName,
					fileName: 'main.py',
					code: updatedCode,
					fileType: 'python',
					depends: [],
				});
				return;
			}

			await mutation.mutateAsync({
				prompt: formValues.prompt,
				app_name: appName,
				page_name: pageName,
				type: isUIPrompt ? 'ui' : 'function',
				block,
				component: name,
				method: formValues.method,
			});

			if (isUIPrompt) {
				setPromptMeta({
					name: null,
					resource: null,
					block: null,
				});
			} else if (tabIndex === 0) {
				setTabIndex(1);
			}
		} catch (e) {
			//
		}
	};

	const handleBack = () => {
		setTabIndex(0);
	};

	if (!resource && !name) {
		return null;
	}

	return (
		<Modal isCentered size="5xl" isOpen onClose={handleCloseModal}>
			<ModalOverlay />
			<ModalContent>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormProvider {...methods}>
						<ModalHeader borderBottomWidth="1px">
							<Stack spacing="0">
								<Text fontSize="xl">Generate code for {name}</Text>
							</Stack>
						</ModalHeader>
						<ModalBody p="0">
							<Tabs index={tabIndex}>
								<TabList>
									<Tab>Prompt Info</Tab>
									{isUIPrompt ? null : (
										<Tab isDisabled={!prompt}>Code Review</Tab>
									)}
								</TabList>

								<TabPanels p="0">
									<TabPanel>
										<Stack spacing="4">
											<FormInput
												maxW="50%"
												name="Select Method"
												id="method"
												type="select"
												options={events}
												validation={{
													required: 'Cannot be empty',
												}}
											/>

											<FormInput
												name="Write prompt"
												id="prompt"
												type="textarea"
											/>
										</Stack>
									</TabPanel>

									<TabPanel p="0">
										<MonacoDiffEditor
											height="400px"
											original={originalCode}
											modified={updatedCode}
											language="python"
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
									</TabPanel>
								</TabPanels>
							</Tabs>

							<ModalFooter p="2" borderTopWidth="1px">
								<Stack direction="row">
									{tabIndex === 1 ? (
										<Button
											size="sm"
											onClick={handleBack}
											variant="outline"
											colorScheme="gray"
										>
											Back
										</Button>
									) : null}

									<Button
										isDisabled={!prompt}
										size="sm"
										colorScheme="blue"
										type="submit"
									>
										{tabIndex === 1 ? 'Approve Changes' : 'Generate'}
									</Button>
								</Stack>
							</ModalFooter>
						</ModalBody>
					</FormProvider>
				</form>
			</ModalContent>
		</Modal>
	);
};
