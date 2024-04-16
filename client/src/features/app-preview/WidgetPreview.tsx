import { Box, CloseButton, Progress, Stack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useWebSocket from 'react-use-websocket';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { pageContextAtom } from '@/features/app-state';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/ComponentEditor';
import { appModeAtom, websocketStatusAtom } from '@/features/app/atoms';
import { AppComponent } from './AppComponent';
import { useGetWebSocketURL } from '../authorization/hooks/useLogin';
import { Notification } from '@/features/app-preview/components/Notification';
import { MirrorTableColumns } from '@/features/app-builder/components/PropertiesEditor/MirrorTableColumnInputs';

export const WidgetPreview = ({ widgetName, inline = false }: any) => {
	const { appName, pageName } = useParams();

	const retryCounter = useRef(0);
	const failedData = useRef<any>(null);

	const [{ widgets, modals }, setPageContext] = useAtom(pageAtom);

	const { isPreview } = useAtomValue(appModeAtom);
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);
	const isDevMode = !isPreview;

	const widget = widgets?.find((w) => w.name === widgetName);

	const isModal = widget?.type === 'modal';

	const { isLoading, components } = useGetWidgetPreview(widgetName || '');
	const [componentsState, setComponentsState] = useState(components);

	const updateMutation = useUpdatePageData();

	const setPageContextState = useSetAtom(pageContextAtom);

	const [allWidgetContext, setWidgetContext]: any = useAtom(pageContextAtom);

	const { properties } = useGetPage({ appName, pageName });

	const websocketURL = useGetWebSocketURL();

	const { sendJsonMessage } = useWebSocket(websocketURL, {
		onOpen: () => {
			setWebsocketIsAlive(true);

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
					const accessToken = localStorage.getItem('access_token');

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

				setPageContextState(messageContext);
			} catch (e) {
				//
			}
		},
		onClose: () => {
			setWebsocketIsAlive(false);
		},

		share: true,
	});

	const reorderMutation = useReorderComponents();

	const widgetContext: any = allWidgetContext[widgetName || ''];

	const handleRemoveAlert = () => {
		setWidgetContext(
			{
				...(allWidgetContext || {}),
				[widgetName]: {
					...(allWidgetContext?.[widgetName] || {}),
					message: null,
					message_type: null,
				},
			},
			{
				replace: true,
			},
		);
	};

	const handleReorderComponents = (newCompState: any[]) => {
		const newProps = {
			...(properties || {}),

			blocks: (properties.blocks || [])?.map((w: any) => {
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

			return {
				...oldPage,
				widgetName: currentModal.caller,
				modals: oldPage.modals.filter((m: any) => m.name !== widgetName),
			};
		});
	};

	const modalIndex = isModal ? modals.findIndex((m: any) => m.name === widgetName) : -1;

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
				zIndex: 3 + modalIndex,
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
								h="full"
								{...(inline
									? {
											direction: 'row',
											// px: 4,
											flexWrap: 'wrap',
											alignItems: 'center',
											spacing: 5,
											w: 'full',
											// divider: <Divider orientation="vertical" h="14" />,
									  }
									: { p: 4, pt: 2, spacing: 3, overflow: 'auto' })}
								data-cy="components-list"
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
													data-cy={`component-${c.name}-inspector`}
													meta={{ widget: widgetName }}
													{...p.draggableProps}
													{...p.dragHandleProps}
												>
													<AppComponent
														key={c.name}
														inline={inline}
														widgetName={widgetName}
														sendJsonMessage={sendJsonMessage}
														{...c}
													/>
												</InspectorContainer>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
								{isDevMode && !inline ? (
									<Stack mt="2">
										<NewComponent
											widgetName={widgetName}
											w="full"
											variant="secondary"
										/>
										<MirrorTableColumns widgetName={widgetName} />
									</Stack>
								) : null}
							</Stack>
						)}
					</Droppable>
				</DragDropContext>

				<Notification
					message={widgetContext?.message}
					type={widgetContext?.message_type}
					onClose={handleRemoveAlert}
				/>

				{reorderMutation.isLoading && <Progress mt="auto" size="xs" isIndeterminate />}
			</Stack>
		</Loader>
	);
};
