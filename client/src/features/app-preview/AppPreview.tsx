import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	IconButton,
	Progress,
	Skeleton,
	Stack,
	Text,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	Icon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChevronDown, X, Tool, Plus } from 'react-feather';
import { useParams } from 'react-router-dom';
import lodashSet from 'lodash/set';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useStatus } from '@/layout/StatusBar';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { useInitializeWidgetState, allWidgetStateAtom } from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { useCreateWidget, useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/ComponentEditor';
import { appModeAtom } from '@/features/app/atoms';
import { AppComponent } from './AppComponent';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { generateSequentialName } from '@/utils';

export const AppPreview = () => {
	const { pageId } = useParams();
	const { isConnected } = useStatus();
	const { widgetId, widgets, appName, pageName } = useAtomValue(pageAtom);
	const setPageAtom = useSetAtom(pageAtom);

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const { isLoading, components, widget } = useGetWidgetPreview(widgetId || '');
	const [componentsState, setComponentsState] = useState(components);

	useInitializeWidgetState({ widgetId: widget?.name, appName, pageName });

	const [widgetData, setWidgetData]: any = useAtom(allWidgetStateAtom);
	const allWidgetState = widgetData.state;

	const createWidgetMutation = useCreateWidget();
	const reorderMutation = useReorderComponents();

	const widgetState: any = allWidgetState[widget?.name];

	const handleRemoveAlert = () => {
		setWidgetData((oldData: any) => ({
			...lodashSet(oldData, `state.${widget?.name}.message`, null),
		}));
	};
	const handleReorderComponents = (newComponentOrder: { id: string; order: number }[]) => {
		reorderMutation.mutate({
			widgetId: widget?.id,
			components: newComponentOrder,
		});
	};
	const handleCreateWidget = () => {
		createWidgetMutation.mutate({
			pageId,
			name: generateSequentialName({
				currentNames: [widget?.name],
				prefix: 'widget',
			}),
		});
	};
	const handleChooseWidget = (widgetId: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetId,
		}));
	};
	const handleOnDragEnd = (result: any) => {
		const { destination, source } = result;
		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newComponentIds = Array.from(componentsState);
		const movedEl = newComponentIds.splice(source.index, 1);
		newComponentIds.splice(destination.index, 0, movedEl[0]);

		setComponentsState(newComponentIds);
		handleReorderComponents(
			newComponentIds.map((c: any, index: number) => ({
				id: c.id,
				order: index,
			})),
		);
	};

	useEffect(() => {
		setComponentsState(components);
	}, [components]);

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
				{reorderMutation.isLoading && <Progress size="xs" isIndeterminate />}
				<Accordion allowToggle>
					<AccordionItem>
						<AccordionButton display="flex" justifyContent="center" h="5">
							<AccordionIcon />
						</AccordionButton>
						<AccordionPanel p={0}>
							<Stack direction="column" p="1">
								{widgets?.map((widget: any) => (
									<Stack
										as="button"
										px="2"
										borderRadius="sm"
										direction="row"
										alignItems="center"
										onClick={() => handleChooseWidget(widget.id)}
										_hover={{
											bg: 'gray.50',
											color: 'gray.800',
										}}
									>
										<Icon as={Tool} mr="2" />
										<Text>{widget?.name}</Text>
									</Stack>
								))}

								{!isPreview && (
									<Button
										variant="outline"
										size="sm"
										colorScheme="gray"
										onClick={handleCreateWidget}
									>
										<Stack
											alignItems="center"
											justifyContent="center"
											direction="row"
										>
											<Icon as={Plus} mr="2" />
											<Box>Add Widget</Box>
										</Stack>
									</Button>
								)}
							</Stack>
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
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
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="droppable-1">
						{(provided: any, _: any) => (
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
										<Draggable key={c.id} draggableId={c.id} index={index}>
											{(provided: any, _: any) => (
												<InspectorContainer
													ref={provided.innerRef}
													key={c.id}
													id={c.id}
													type="component"
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													<AppComponent key={c.id} {...c} />
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
										mt="auto"
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
