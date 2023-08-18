/* eslint-disable  */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'react-feather';
import { Box, IconButton } from '@chakra-ui/react';
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
	const [uiCode, setUiCode] = useAtom(uiCodeAtom);
	const { appId } = useParams();
	const { uiComponents } = useGetApp(appId || '');

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
		code: uiCode || '',
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
							isLoading={isLoading}
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
	const [runResult] = useAtom(runResultAtom);
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
					<Box
						p="4"
						bg="black"
						color="white"
						borderRadius="md"
						boxShadow="md"
						fontFamily="monospace"
						overflowX="auto"
						whiteSpace="pre-wrap"
					>
						{runResult}
					</Box>
				</Box>
			</Panel>
		</PanelGroup>
	);
};
