import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	Code,
	IconButton,
	Progress,
	Skeleton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'react-feather';
import { useParams } from 'react-router-dom';
import lodashSet from 'lodash/set';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useWebSocket from 'react-use-websocket';
import { useStatus } from '@/layout/StatusBar';
import { axios } from '@/lib/axios';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import {
	useInitializeWidgetState,
	allWidgetStateAtom,
	nonWidgetContextAtom,
} from '@/features/app-state';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useCreateWidget, useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/ComponentEditor';
import { appModeAtom } from '@/features/app/atoms';
import { AppComponent } from './AppComponent';
import { generateSequentialName } from '@/utils';
import { NewWidget } from '@/features/app-preview/components/NewWidget';
import { WidgetSwitcher } from '@/features/app-preview/components/WidgetSwitcher';

// websocket
export const SOCKET_URL = `${import.meta.env.VITE_WORKER_WS_ENDPOINT}/ws`;

export const AppPreview = () => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const retryCounter = useRef(0);
	const failedData = useRef<any>(null);

	const widgetLabel = widgets?.find((w) => w.name === widgetName)?.label;

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const {
		isLoading,
		components,
		description: widgetDescription,
	} = useGetWidgetPreview(widgetName || '');
	const [componentsState, setComponentsState] = useState(components);
	useInitializeWidgetState({ widgetName, appName, pageName });

	const updateMutation = useUpdatePageData();

	const setNonInteractiveState = useSetAtom(nonWidgetContextAtom);

	const [widgetData, setWidgetData]: any = useAtom(allWidgetStateAtom);
	const allWidgetState = widgetData.state;

	const { properties } = useGetPage({ appName, pageName });
	const createMutation = useCreateWidget();
	const { sendJsonMessage } = useWebSocket(SOCKET_URL, {
		onOpen: () => {
			sendJsonMessage({
				type: 'auth',
				access_token: localStorage.getItem('worker_access_token'),
			});
		},
		onMessage: async (message) => {
			try {
				const messageData: {
					authenticated?: boolean;
					context?: any;
					failed_data?: any;
					type?: string;
				} = JSON.parse(message?.data);
				if (messageData?.type === 'auth_error' && retryCounter.current < 3) {
					const response = await axios.post('/user/refresh');
					const accessToken = response?.data?.access_token;
					localStorage.setItem('worker_access_token', accessToken);
					sendJsonMessage({
						type: 'auth',
						access_token: accessToken,
					});
					retryCounter.current += 1;
					failedData.current = messageData?.failed_data;
				}
				if (messageData?.authenticated === true) {
					if (failedData.current) {
						sendJsonMessage(failedData.current);
						failedData.current = null;
					}
				}

				const messageContext = messageData?.context;
				if (!messageContext) {
					return;
				}

				const { widgets: newWidgetsData, ...rest } = messageContext || {};

				setWidgetData((s: any) => ({ ...s, state: newWidgetsData || {} }));
				setNonInteractiveState(rest);
			} catch (e) {
				//
			}
		},

		share: true,
	});

	const reorderMutation = useReorderComponents();

	const widgetState: any = allWidgetState[widgetName || ''];

	const handleRemoveAlert = () => {
		setWidgetData((oldData: any) => ({
			...lodashSet(oldData, `state.${widgetName}.message`, null),
		}));
	};

	const handleReorderComponents = (newCompState: any[]) => {
		const newProps = {
			...(properties || {}),

			widgets: properties?.widgets?.map((w: any) => {
				if (w.name !== widgetName) {
					return w;
				}

				return {
					...w,
					components: newCompState,
				};
			}),
		};
		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: newProps,
		});
	};

	const handleCreateWidget = () => {
		const { name: wName, label: wLabel } = generateSequentialName({
			currentNames: widgets?.map((w: any) => w.name) as string[],
			prefix: 'widget',
		});

		createMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				widgets: [
					...(properties?.widgets || []),
					{
						name: wName,
						label: wLabel,
						type: 'base',
						menu_item: true,
						components: [],
					},
				],
			},
		});
	};

	const handleOnDragEnd = (result: any) => {
		const { destination, source } = result;
		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newComponentState = Array.from(componentsState);
		const movedEl = newComponentState.splice(source.index, 1);
		newComponentState.splice(destination.index, 0, movedEl[0]);
		setComponentsState(newComponentState);
		handleReorderComponents(newComponentState);
	};

	useEffect(() => {
		setComponentsState(components);
	}, [components]);

	if (!widgetName) {
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

					<Box h={8} maxW="fit-content" p="2" bg="blue.500" borderWidth="1px">
						<Skeleton
							w="24"
							borderRadius="sm"
							h="full"
							startColor="gray.50"
							flex="1"
							endColor="gray.50"
						/>
					</Box>
				</Stack>
				<Stack mt="6">
					<Text fontWeight="medium" fontSize="md">
						Extend your Smart Table with Widgets and Functions
					</Text>
					<Button
						w="fit-content"
						colorScheme="blue"
						size="sm"
						isLoading={createMutation.isLoading}
						isDisabled={!isConnected}
						onClick={handleCreateWidget}
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
				{reorderMutation.isLoading && <Progress size="xs" isIndeterminate />}
				<Stack px="4" pt="4" pb="2" borderBottomWidth="1px" direction="row">
					<InspectorContainer flex="1" noPadding type="widget" id={widgetName}>
						<Stack spacing="0">
							<Stack direction="row" display="flex" alignItems="center">
								<Text fontSize="lg" fontWeight="semibold">
									{widgetLabel || widgetName}
								</Text>
								{!isPreview && (
									<Code fontSize="sm" bg="transparent" color="gray.600" ml="3">
										{widgetName}
									</Code>
								)}
							</Stack>

							{widgetDescription ? (
								<Text fontSize="sm" color="gray.600">
									{widgetDescription}
								</Text>
							) : null}
						</Stack>
					</InspectorContainer>

					<NewWidget />
					<WidgetSwitcher />
				</Stack>
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="droppable-1">
						{(provided: any) => (
							<Stack
								ref={provided.innerRef}
								p="4"
								pt="2"
								h="full"
								overflow="auto"
								spacing="3"
								{...provided.droppableProps}
							>
								{componentsState.map((c: any, index: number) => {
									return (
										<Draggable key={c.name} draggableId={c.name} index={index}>
											{(p: any) => (
												<InspectorContainer
													ref={p.innerRef}
													key={c.name}
													id={c.name}
													type="component"
													{...p.draggableProps}
													{...p.dragHandleProps}
												>
													<AppComponent
														key={c.name}
														sendJsonMessage={sendJsonMessage}
														{...c}
													/>
												</InspectorContainer>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
								{isDevMode ? (
									<Box
										w="full"
										p="2"
										bg="white"
										borderWidth="1px"
										borderStyle="dashed"
										borderRadius="md"
										mt="2"
									>
										<NewComponent w="full" variant="secondary" />
									</Box>
								) : null}
							</Stack>
						)}
					</Droppable>
				</DragDropContext>

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
