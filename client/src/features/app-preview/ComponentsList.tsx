import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Stack } from '@chakra-ui/react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { appModeAtom, websocketStatusAtom } from '@/features/app/atoms';
import { pageContextAtom } from '@/features/app-state';
import { useGetWebSocketURL } from '@/features/authorization/hooks/useLogin';

export const ComponentsList = ({
	components,
	id,
	inline,
	children,
	renderNewComponent,
	reorderComponents,
}: any) => {
	const retryCounter = useRef(0);
	const failedData = useRef<any>(null);

	const { isPreview } = useAtomValue(appModeAtom);
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);
	const isDevMode = !isPreview;

	const [orderedComponents, setComponentsOrder] = useState(components);

	const setPageContextState = useSetAtom(pageContextAtom);

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

	const handleOnDragEnd = (result: any) => {
		const { destination, source } = result;

		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newComponentState = Array.from(orderedComponents);
		const movedEl = newComponentState.splice(source.index, 1);
		newComponentState.splice(destination.index, 0, movedEl[0]);
		setComponentsOrder(newComponentState);

		reorderComponents(newComponentState);
	};

	useEffect(() => {
		setComponentsOrder(components);
	}, [components]);

	return (
		<DragDropContext onDragEnd={handleOnDragEnd}>
			<Droppable
				direction={inline ? 'horizontal' : 'vertical'}
				droppableId={`${id}-drop-area`}
			>
				{(provided: any) => (
					<Stack
						ref={provided.innerRef}
						h="full"
						{...(inline
							? {
									direction: 'row',
									flexWrap: 'wrap',
									alignItems: 'center',
									spacing: 8,
									w: 'full',
							  }
							: { p: 4, pt: 2, spacing: 3, overflow: 'auto' })}
						data-cy="components-list"
						{...provided.droppableProps}
					>
						{orderedComponents.map((c: any, index: number) => {
							return (
								<Draggable key={c.name} draggableId={c.name} index={index}>
									{(p: any) =>
										children({
											containerProps: {
												ref: p.innerRef,
												...p.draggableProps,
												...p.dragHandleProps,
											},
											component: c,
											sendJsonMessage,
											inline,
										})
									}
								</Draggable>
							);
						})}
						{provided.placeholder}
						{isDevMode ? renderNewComponent() : null}
					</Stack>
				)}
			</Droppable>
		</DragDropContext>
	);
};
