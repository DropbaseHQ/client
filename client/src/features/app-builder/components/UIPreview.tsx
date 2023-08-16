/* eslint-disable  */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'react-feather';
import { Box, IconButton, Textarea } from '@chakra-ui/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useGetUIJson } from '@/features/app/hooks/useGetUIJson';
import { CustomInput, CustomButton } from '@/utils/uiBuilder';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';
import { useParams } from 'react-router-dom';
import { UIEditor } from './UIEditor';
import { useGetApp } from '@/features/app/hooks';
import { useSetAtom, useAtom } from 'jotai';
import { userInputAtom, uiCodeAtom, runResultAtom } from '../atoms/tableContextAtoms';

export const UIPreview = () => {
	// const [, setFormData] = useState([]);
	const methods = useForm({
		shouldUnregister: true,
	});
	const { appId } = useParams();
	const [uiCode] = useAtom(uiCodeAtom);
	const { components, refetch, isFetching } = useGetUIJson({
		app_id: appId || '',
		code: uiCode || '',
	});
	const updateUserInput = useSetAtom(userInputAtom);
	const onRefreshUI = () => {
		refetch();
	};
	const formValues = methods.watch();
	useEffect(() => {
		updateUserInput(formValues);
	}, [formValues, updateUserInput]);

	const sortUI = (components: any) =>
		components.map((c: any) => {
			const UIType = Object.keys(c)[0];
			const props = c[UIType];
			if (UIType === 'UIInput') {
				return <CustomInput key={props.name} {...props} />;
			}
			if (UIType === 'UIButton') {
				return <CustomButton key={props.name} {...props} />;
			}
		});

	// useEffect(() => {
	// 	const componentList = components.map((obj: any) => Object.values(obj));
	// 	setFormData(componentList);
	// }, [components, setFormData]);

	return (
		<>
			<Box>
				<Box p="0" w="full">
					<Box w="full" display="flex" justifyContent="space-between">
						UI Preview
						<IconButton
							aria-label="Refresh UI"
							size="xs"
							icon={<RefreshCw size="16" />}
							variant="outline"
							isLoading={isFetching}
							onClick={onRefreshUI}
						/>
					</Box>

					<FormProvider {...methods}>{sortUI(components)}</FormProvider>
				</Box>
			</Box>
		</>
	);
};

export const UIPanel = () => {
	const setUiCode = useSetAtom(uiCodeAtom);
	const { appId } = useParams();
	const { uiComponents } = useGetApp(appId || '');
	const [runResult] = useAtom(runResultAtom);

	useEffect(() => {
		if (uiComponents?.[0]) {
			const code = uiComponents?.[0].code;
			if (code) {
				setUiCode(code);
			}
		}
	}, [uiComponents]);

	return (
		<PanelGroup direction="vertical">
			<Panel defaultSize={50}>
				<UIEditor />
			</Panel>

			<PanelHandle direction="horizontal" />

			<Panel maxSize={80}>
				<Box bg="gray.50" p="4" h="full">
					<UIPreview />
				</Box>
			</Panel>
			<PanelHandle direction="horizontal" />

			<Panel defaultSize={10}>
				<Box bg="gray.50" p="4" h="full">
					Console
					<Textarea
						value={runResult}
						placeholder="Will display the result of your action function"
					/>
				</Box>
			</Panel>
		</PanelGroup>
	);
};
