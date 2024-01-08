import { useState, useEffect } from 'react';
import { Box, Progress, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/page';
import { SmartTable } from './SmartTable';
import { InspectorContainer } from '@/features/app-builder';
import { appModeAtom } from '@/features/app/atoms';
import { NewTable } from '@/features/app-builder/components/PropertiesEditor/NewTable';

import { useReorderTables } from './hooks';

export const StackedTables = () => {
	const { appName, pageName } = useParams();

	const { isPreview } = useAtomValue(appModeAtom);
	const { tables } = useGetPage({ appName, pageName });

	const [tableState, setTableState] = useState(tables);

	const reorderMutation = useReorderTables();

	const handleDragEnd = (result: any) => {
		const { destination, source } = result;
		if (!destination) {
			return;
		}
		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newTableOrder = Array.from(tableState);
		const movedEl = newTableOrder.splice(source.index, 1);
		newTableOrder.splice(destination.index, 0, movedEl[0]);

		setTableState(newTableOrder);
		reorderMutation.mutate({
			// FIXME: pageId
			// pageId,
			tables: newTableOrder.map((t: any, index: number) => ({ id: t.id, order: index })),
		});
	};

	useEffect(() => {
		setTableState(tables);
	}, [tables]);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			{reorderMutation.isLoading && <Progress size="xs" isIndeterminate />}

			<Droppable droppableId="droppable-2">
				{(provided: any) => (
					<Stack
						ref={provided.innerRef}
						bg="white"
						spacing="8"
						p="4"
						h="full"
						overflow="auto"
						{...provided.droppableProps}
					>
						{tableState.map((table: any, index: number) => (
							<Draggable
								key={table.id}
								draggableId={table.id}
								index={index}
								isDragDisabled={isPreview}
							>
								{(p: any) => (
									<Box
										flexShrink="0"
										key={table.id}
										ref={p.innerRef}
										{...p.draggableProps}
										{...p.dragHandleProps}
									>
										<InspectorContainer
											h="full"
											w="full"
											type="table"
											id={table.name}
										>
											<SmartTable tableName={table.name} />
										</InspectorContainer>
									</Box>
								)}
							</Draggable>
						))}
						{provided.placeholder}
						{isPreview ? null : (
							<Box
								ml="auto"
								borderWidth="1px"
								borderStyle="dashed"
								p="2"
								borderRadius="md"
								minW="48"
							>
								<NewTable w="full" variant="secondary" />
							</Box>
						)}
					</Stack>
				)}
			</Droppable>
		</DragDropContext>
	);
};
