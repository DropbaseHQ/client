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
import { useSetAtom } from 'jotai';
import { userInputAtom } from '../atoms/tableContextAtoms';

export const UIPreview = ({
	components,
	refetch,
	isLoading,
}: {
	components: any;
	refetch: () => void;
	isLoading: any;
}) => {
	const [formData, setFormData] = useState([]);
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

	const sortUI = (components: any) =>
		components.map((c: any) => {
			const UIType = Object.keys(c)[0];
			const props = c[UIType];
			if (UIType === 'UIInput') {
				return <CustomInput key={props.name} {...props} setFormData={setFormData} />;
			}
			if (UIType === 'UIButton') {
				return <CustomButton key={props.name} {...props} setFormData={setFormData} />;
			}
		});
	useEffect(() => {
		const componentList = components.map((obj: any) => Object.values(obj));
		setFormData(componentList);
	}, [components, setFormData]);

	return (
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
	);
};

export const UIPanel = () => {
	const [code, setCode] = useState('');

	const { appId } = useParams();
	const { components, refetch, isFetching } = useGetUIJson({
		app_id: appId || '',
		code: code || '',
	});

	return (
		<PanelGroup direction="vertical">
			<Panel defaultSize={50}>
				<UIEditor code={code} setCode={setCode} />
			</Panel>

			<PanelHandle direction="horizontal" />

			<Panel maxSize={80}>
				<Box bg="gray.50" p="6" h="full">
					<UIPreview components={components} refetch={refetch} isLoading={isFetching} />
				</Box>
			</Panel>
		</PanelGroup>
	);
};
