/* eslint-disable  */
import { PanelHandle } from '@/components/Panel';
import { useGetApp } from '@/features/app/hooks';
import { useGetUIJson } from '@/features/app/hooks/useGetUIJson';
import { BG_BUTTON, BG_FOCUSED, BG_UNFOCUSED } from '@/utils/constants';
import { CustomButton, CustomInput } from '@/utils/uiBuilder';
import { Alert, AlertDescription, AlertIcon, Box, IconButton, Stack, Text } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { runResultAtom, uiCodeAtom, userInputAtom } from '../atoms/tableContextAtoms';
import { UIEditor } from './UIEditor';

export const UIPreview = () => {
	const [uiCode, setUiCode] = useAtom(uiCodeAtom);
	const { appId } = useParams();
	const { uiComponents } = useGetApp(appId || '');

	const log = useAtomValue(runResultAtom);

	useEffect(() => {
		if (uiComponents?.[0]) {
			const code = uiComponents?.[0].code;
			if (code) {
				setUiCode(code);
			}
		}
	}, [uiComponents]);

	const {
		components,
		refetch,
		isFetching: isLoading,
	} = useGetUIJson({
		app_id: appId || '',
		code: (uiCode || '').trim(),
	});

	const [, setFormData] = useState([]);
	const methods = useForm({
		shouldUnregister: true,
	});
	const updateUserInput = useSetAtom(userInputAtom);
	const onRefreshUI = () => {
		refetch();
	};

	const formValues = methods.watch();
	useEffect(() => {
		updateUserInput(formValues);
	}, [formValues, updateUserInput]);

	const sortUI = (components: any[]) =>
		components.flatMap((c: any) => {
			// Do not render if c.name is not provided or all values are falsy
			if (!c?.name || Object.values(c).every((val) => !val)) {
				return [];
			}

			if (c.type === 'button') {
				return <CustomButton key={c.name} {...c} />;
			}

			return <CustomInput key={c.name} {...c} setFormData={setFormData} />;
		});

	useEffect(() => {
		const componentList = components.map((obj: any) => Object.values(obj));
		setFormData(componentList);
	}, [components, setFormData]);

	return (
		<Stack bg={BG_FOCUSED} p="4" h="full">
			<Box w="full" display="flex" justifyContent="space-between">
				UI Preview
				<IconButton
					aria-label="Refresh UI"
					size="xs"
					icon={<RefreshCw size="16" />}
					variant="outline"
					isLoading={isLoading}
					onClick={onRefreshUI}
				/>
			</Box>

			<FormProvider {...methods}>{sortUI(components)}</FormProvider>

			{log ? (
				<Alert borderRadius="md" status={log.status}>
					<AlertIcon />
					<AlertDescription>{log.result}</AlertDescription>
				</Alert>
			) : null}
		</Stack>
	);
};

export const UIPanel = () => {
	const log = useAtomValue(runResultAtom);
	const setLog = useSetAtom(runResultAtom);
	const runResult = log
		? `Result:
${log.result}\n
Stdout:
${log.stdout}\n
Traceback:
${log.traceback}`
		: '';

	return (
		<PanelGroup direction="vertical">
			<Panel>
				<Box py="0.5rem" bg={BG_UNFOCUSED} overflow="hidden" h="full">
					<UIEditor />
				</Box>
			</Panel>
			{runResult ? <PanelHandle direction="horizontal" /> : null}

			{runResult ? (
				<Panel>
					<Stack h="full" pt="2" borderTopWidth="1px" pl="1rem">
						<Stack direction="row" alignItems="center">
							<IconButton
								aria-label="Close output"
								isRound={true}
								size="xs"
								color="black"
								backgroundColor={BG_BUTTON}
								icon={<X size={14} />}
								onClick={() => setLog(null)}
							/>

							<Text px="2" fontSize="xs" letterSpacing="wide" fontWeight="bold">
								Output
							</Text>
						</Stack>

						<Box pl="1.5rem">
							<MonacoEditor
								language="shell"
								height={`${(runResult.split('\n').length || 1) * 20}px`}
								options={{
									readOnly: true,
									minimap: { enabled: false },
									glyphMargin: false,
									lineNumbers: 'off',
									overviewRulerLanes: 0,
									scrollBeyondLastLine: false,
									wordWrap: 'on',
									wrappingStrategy: 'advanced',
								}}
								value={runResult}
							/>
						</Box>
					</Stack>
				</Panel>
			) : null}
		</PanelGroup>
	);
};
