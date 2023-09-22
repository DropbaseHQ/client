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
import { ChevronDown, RefreshCw, X } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';

import lodashSet from 'lodash/set';

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
				my="1.5"
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
			{component.label ? <FormLabel lineHeight={1}>{component.label}</FormLabel> : null}

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

export const NewAppPreview = ({ isDevMode }: any) => {
	const { pageId } = useParams();

	const { widgetId } = useAtomValue(pageAtom);

	const { isLoading, refetch, components, widget, isRefetching } = useGetWidgetPreview(
		widgetId || '',
	);

	useInitializeWidgetState({ widgetId: widget?.name, pageId });

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
					<Text fontWeight="medium">Extend your AI Table with Widgets and Functions</Text>
					<Button
						w="fit-content"
						colorScheme="blue"
						size="sm"
						isLoading={mutation.isLoading}
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

					{isDevMode ? (
						<IconButton
							aria-label="Refresh UI"
							size="xs"
							icon={<RefreshCw size="14" />}
							variant="outline"
							isLoading={isRefetching}
							onClick={() => refetch()}
						/>
					) : null}
				</Stack>
				<Stack p="4" spacing="3">
					{components.map((c: any) => {
						return <AppComponent key={c.id} {...c} />;
					})}
				</Stack>
			</Skeleton>
			{widgetState?.message ? (
				<Stack flexShrink="0" pos="sticky" bottom="0" w="full" flexGrow="0">
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
	);
};
