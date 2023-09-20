import {
	Alert,
	AlertIcon,
	Button,
	Center,
	FormControl,
	FormHelperText,
	FormLabel,
	IconButton,
	Skeleton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { RefreshCw } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';

import { useExecuteAction, useGetWidgetPreview } from '@/features/new-app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import {
	widgetComponentsAtom,
	useInitializeWidgetState,
	allWidgetStateAtom,
	useSyncState,
	newPageStateAtom,
} from '@/features/new-app-state';
import { pageAtom } from '@/features/new-page';
import { useCreateWidget } from '@/features/new-app-builder/hooks';

const AppComponent = (props: any) => {
	const { pageId } = useParams();
	const { type, property: component } = props;

	const [widgetComponents, setWidgetComponentValues] = useAtom(widgetComponentsAtom) as any;
	const inputState = widgetComponents?.[component.name] || {};

	const pageState = useAtomValue(newPageStateAtom);
	const syncState = useSyncState();

	const actionMutation = useExecuteAction({
		onSuccess: (data: any) => {
			syncState(data);
		},
	});

	const handleAction = (actionName: string) => {
		actionMutation.mutate({
			pageId,
			functionName: actionName,
			pageState,
		});
	};

	if (type === 'button') {
		return (
			<Button
				size="sm"
				isLoading={actionMutation.isLoading}
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
		return <Text>{component.text}</Text>;
	}

	return (
		<FormControl key={component.name}>
			<FormLabel>{component.label}</FormLabel>

			<InputRenderer
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
				options={inputState.options}
			/>

			{inputState?.message ? <FormHelperText>{inputState.message}</FormHelperText> : null}
		</FormControl>
	);
};

export const NewAppPreview = () => {
	const { pageId } = useParams();

	const { widgetId } = useAtomValue(pageAtom);

	const { isLoading, refetch, components, widget, isRefetching } = useGetWidgetPreview(
		widgetId || '',
	);

	useInitializeWidgetState({ widgetId: widget?.name, pageId });

	const allWidgetState: any = useAtomValue(allWidgetStateAtom).state;
	const widgetState: any = allWidgetState[widget?.name];

	const mutation = useCreateWidget();

	if (!widgetId) {
		return (
			<Stack as={Center} bg="white" h="full">
				<Button
					variant="outline"
					colorScheme="blue"
					size="sm"
					isLoading={mutation.isLoading}
					onClick={() => {
						mutation.mutate({
							pageId,
							name: 'App',
						});
					}}
				>
					New App
				</Button>
			</Stack>
		);
	}

	return (
		<Stack bg="white" h="full" justifyContent="space-between">
			<Skeleton isLoaded={!isLoading}>
				<Stack
					px="4"
					py="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
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

					<IconButton
						aria-label="Refresh UI"
						size="xs"
						icon={<RefreshCw size="14" />}
						variant="outline"
						isLoading={isRefetching}
						onClick={() => refetch()}
					/>
				</Stack>
				<Stack p="4">
					{components.map((c: any) => {
						return <AppComponent key={c.id} {...c} />;
					})}
				</Stack>
			</Skeleton>
			{widgetState?.message ? (
				<Alert
					flexShrink="0"
					pos="sticky"
					bottom="0"
					w="full"
					flexGrow="0"
					bg="transparent"
					status={widgetState?.message_type || 'info'}
					variant="top-accent"
					borderTopWidth="3px"
				>
					<AlertIcon />
					{widgetState?.message}
				</Alert>
			) : null}
		</Stack>
	);
};
