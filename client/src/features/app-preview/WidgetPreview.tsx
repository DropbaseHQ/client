import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	CloseButton,
	IconButton,
	Progress,
	Stack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { X } from 'react-feather';
import { useParams } from 'react-router-dom';
import lodashSet from 'lodash/set';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useWebSocket from 'react-use-websocket';
import { axios } from '@/lib/axios';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { allWidgetStateAtom, nonWidgetContextAtom } from '@/features/app-state';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/ComponentEditor';
import { appModeAtom } from '@/features/app/atoms';
import { AppComponent } from './AppComponent';

// websocket
export const SOCKET_URL = `${import.meta.env.VITE_WORKER_WS_ENDPOINT}/ws`;

export const WidgetPreview = ({ widgetName }: any) => {
	const { appName, pageName } = useParams();

	const retryCounter = useRef(0);
	const failedData = useRef<any>(null);

	const [{ widgets, modals }, setPageContext] = useAtom(pageAtom);

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const widget = widgets?.find((w) => w.name === widgetName);

	const isModal = widget?.type === 'modal';

	const { isLoading, components } = useGetWidgetPreview(widgetName || '');
	const [componentsState, setComponentsState] = useState(components);

	const updateMutation = useUpdatePageData();

	const setNonInteractiveState = useSetAtom(nonWidgetContextAtom);

	const [widgetData, setWidgetData]: any = useAtom(allWidgetStateAtom);
	const allWidgetState = widgetData.state;

	const { properties } = useGetPage({ appName, pageName });

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

	const disableModal = () => {
		setPageContext((oldPage: any) => {
			const currentModal = oldPage.modals.find((m: any) => m.name === widgetName);

			console.log(oldPage.modals.filter((m: any) => m.name !== widgetName));

			return {
				...oldPage,
				widgetName: currentModal.caller,
				modals: oldPage.modals.filter((m: any) => m.name !== widgetName),
			};
		});
	};

	const showModalStyles = isModal && modals.map((m: any) => m.name).includes(widgetName);

	const containerStyles = showModalStyles
		? {
				width: 'calc(100% - 20px)',
				mx: 'auto',
				height: 'calc(100% - 20px)',
				shadow: 'xl',
				borderRadius: 'md',
				borderWidth: '1px',

				pt: 3,
				top: '10px',
				left: '10px',
				zIndex: 3,
		  }
		: {
				h: 'full',
		  };

	return (
		<Loader isLoading={isLoading}>
			{showModalStyles ? (
				<Box
					w="full"
					h="full"
					position="fixed"
					bg="blackAlpha.100"
					top="0"
					left="0"
					zIndex={2}
					onClick={disableModal}
				/>
			) : null}
			<Stack
				position={showModalStyles ? 'absolute' : 'initial'}
				{...containerStyles}
				bg="white"
			>
				{showModalStyles ? (
					<CloseButton
						bg="white"
						borderWidth="1px"
						position="absolute"
						top="-3"
						right="-3"
						size="xs"
						onClick={disableModal}
					/>
				) : null}
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId={`widget-${widgetName}-drop-area`}>
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
										<NewComponent
											widgetName={widgetName}
											w="full"
											variant="secondary"
										/>
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
				{reorderMutation.isLoading && <Progress mt="auto" size="xs" isIndeterminate />}
			</Stack>
		</Loader>
	);
};
