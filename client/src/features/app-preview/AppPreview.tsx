import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	IconButton,
	Skeleton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { ChevronDown, X } from 'react-feather';
import { useParams } from 'react-router-dom';
import lodashSet from 'lodash/set';
import { useAtom, useAtomValue } from 'jotai';
import { useStatus } from '@/layout/StatusBar';
import { getErrorMessage } from '@/utils';

import { useExecuteAction, useGetWidgetPreview } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import {
	widgetComponentsAtom,
	useInitializeWidgetState,
	allWidgetStateAtom,
	useSyncState,
	newPageStateAtom,
	allWidgetsInputAtom,
} from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { useCreateWidget } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { checkAllRulesPass } from '@/features/app-preview/utils';
import { InspectorContainer } from '@/features/app-builder';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/ComponentEditor';
import { appModeAtom } from '@/features/app/atoms';
import { useToast } from '@/lib/chakra-ui';

const sizeMap: any = {
	small: 'sm',
	medium: 'md',
	large: 'lg',
};

const AppComponent = (props: any) => {
	const toast = useToast();
	const { pageName, appName } = useAtomValue(pageAtom);
	const { type, property: component } = props;

	const pageState = useAtomValue(newPageStateAtom);

	const { widgetId } = useAtomValue(pageAtom);
	const { widget } = useGetWidgetPreview(widgetId || '');

	const [allWidgetComponents, setWidgetComponentValues] = useAtom(widgetComponentsAtom) as any;
	const widgetComponents = allWidgetComponents[widget.name]?.components || {};
	const inputState = widgetComponents?.[component.name] || {};

	const allUserInputValues: any = useAtomValue(allWidgetsInputAtom);

	const widgetInputs = allUserInputValues?.[widget.name] || {};

	const syncState = useSyncState();

	const { isPreview } = useAtomValue(appModeAtom);
	const isEditorMode = !isPreview;

	const shouldDisplay = checkAllRulesPass({
		values: widgetInputs,
		rules: component.display_rules,
	});
	const grayOutComponent = !shouldDisplay && isEditorMode;

	const actionMutation = useExecuteAction({
		onSuccess: (data: any) => {
			syncState(data);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to execute action',
				description: getErrorMessage(error),
			});
		},
	});

	const handleAction = (actionName: string) => {
		actionMutation.mutate({
			pageName,
			appName,
			functionName: actionName,
			pageState,
		});
	};

	if (!shouldDisplay && !isEditorMode) {
		return null;
	}

	if (type === 'button') {
		return (
			<Button
				my="1.5"
				size="sm"
				isLoading={actionMutation.isLoading}
				bgColor={grayOutComponent ? 'gray.100' : ''}
				colorScheme={component.color || 'blue'}
				onClick={() => {
					if (component.on_click) {
						handleAction(component.on_click);
					}
				}}
			>
				{component.label}
			</Button>
		);
	}

	if (type === 'text') {
		return (
			<Text
				fontSize={sizeMap[component.size]}
				color={component.color || `${component.color}.500`}
				bgColor={grayOutComponent ? 'gray.100' : ''}
			>
				{component.text}
			</Text>
		);
	}

	return (
		<FormControl key={component.name} bgColor={grayOutComponent ? 'gray.100' : ''}>
			{component.label ? <FormLabel lineHeight={1}>{component.label}</FormLabel> : null}
			<InputRenderer
				placeholder={component?.placeholder}
				value={inputState?.value}
				name={component.name}
				type={type === 'select' ? 'select' : component.type}
				onChange={(newValue: any) => {
					setWidgetComponentValues({
						[component.name]: newValue,
					});

					if (component.on_change) {
						handleAction(component.on_change);
					}
				}}
				options={inputState.options || component.options}
			/>

			{inputState?.message ? <FormHelperText>{inputState.message}</FormHelperText> : null}
		</FormControl>
	);
};

export const AppPreview = () => {
	const { pageId } = useParams();
	const { isConnected } = useStatus();
	const { widgetId } = useAtomValue(pageAtom);

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const { isLoading, components, widget } = useGetWidgetPreview(widgetId || '');

	const { appName, pageName } = useAtomValue(pageAtom);

	useInitializeWidgetState({ widgetId: widget?.name, appName, pageName });

	const [widgetData, setWidgetData]: any = useAtom(allWidgetStateAtom);
	const allWidgetState = widgetData.state;

	const widgetState: any = allWidgetState[widget?.name];

	const handleRemoveAlert = () => {
		setWidgetData((oldData: any) => ({
			...lodashSet(oldData, `state.${widget?.name}.message`, null),
		}));
	};

	const mutation = useCreateWidget();

	if (!widgetId) {
		if (!isDevMode) {
			return null;
		}

		return (
			<Stack p={6} bg="white" h="full">
				<Stack borderWidth="1px" borderRadius="sm" px={4} pt={4} pb={24} bg="gray.50">
					<Skeleton bg="gray.100" borderRadius="sm" h={8} speed={0} />
					<Box h={8} bg="white" borderWidth="1px" />
					<Stack
						direction="row"
						justifyContent="space-between"
						h={8}
						bg="white"
						p="2"
						alignItems="center"
						borderWidth="1px"
					>
						<Skeleton startColor="gray.100" flex="1" endColor="gray.100" h="full" />
						<ChevronDown size="14" />
					</Stack>

					<Box h={8} w="fit-content" p="2" bg="blue.500" borderWidth="1px">
						<Skeleton
							w="32"
							borderRadius="sm"
							h="full"
							startColor="gray.50"
							flex="1"
							endColor="gray.50"
						/>
					</Box>
				</Stack>
				<Stack mt="6">
					<Text fontWeight="medium">
						Extend your Smart Table with Widgets and Functions
					</Text>
					<Button
						w="fit-content"
						colorScheme="blue"
						size="sm"
						isLoading={mutation.isLoading}
						isDisabled={!isConnected}
						onClick={() => {
							mutation.mutate({
								pageId,
								name: 'widget1',
							});
						}}
					>
						Build Widget
					</Button>
				</Stack>
			</Stack>
		);
	}

	return (
		<Loader isLoading={isLoading}>
			<Stack bg="white" h="full">
				<Stack
					px="4"
					py="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<InspectorContainer noPadding type="widget" id={widgetId}>
						<Stack spacing="0">
							<Text fontSize="md" fontWeight="semibold">
								{widget?.property?.name}
							</Text>
							{widget?.property?.description ? (
								<Text fontSize="sm" color="gray.600">
									{widget?.property?.description}
								</Text>
							) : null}
						</Stack>
					</InspectorContainer>
				</Stack>

				<Stack p="4" h="full" overflow="auto" spacing="3">
					{components.map((c: any) => {
						return (
							<InspectorContainer key={c.id} id={c.id} type="component">
								<AppComponent key={c.id} {...c} />
							</InspectorContainer>
						);
					})}
					{isDevMode ? (
						<Box
							w="full"
							p="2"
							bg="white"
							borderWidth="1px"
							borderStyle="dashed"
							borderRadius="md"
							mt="auto"
						>
							<NewComponent w="full" variant="secondary" />
						</Box>
					) : null}
				</Stack>

				{widgetState?.message ? (
					<Stack
						flexShrink="0"
						pos="sticky"
						mt="auto"
						bg="gray.50"
						bottom="0"
						w="full"
						flexGrow="0"
					>
						<Alert
							bg="transparent"
							status={widgetState?.message_type || 'info'}
							variant="top-accent"
							borderTopWidth="3px"
						>
							<AlertIcon />

							<AlertDescription>{widgetState?.message}</AlertDescription>
						</Alert>
						<IconButton
							position="absolute"
							top={-3}
							h={6}
							w={6}
							right={2}
							alignSelf="start"
							justifySelf="start"
							aria-label="Close alert"
							size="sm"
							borderRadius="full"
							icon={<X size="16" />}
							bg="white"
							borderColor="blue.500"
							borderWidth="1px"
							variant="ghost"
							onClick={handleRemoveAlert}
						/>
					</Stack>
				) : null}
			</Stack>
		</Loader>
	);
};
