import { useState, useEffect } from 'react';
import { Box, Progress, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import styled from '@emotion/styled';

import RGL, { WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useGetPage, useUpdatePageData } from '@/features/page';
import { SmartTable } from './SmartTable';
import { InspectorContainer } from '@/features/app-builder';
import { appModeAtom } from '@/features/app/atoms';
import { NewTable } from '@/features/app-builder/components/PropertiesEditor/NewTable';

const ReactGridLayout = WidthProvider(RGL);

const StackedTableWrapper = styled(Stack)`
	.react-grid-item.react-grid-placeholder {
		background: ${(props: any) => props.theme.colors.blue[100]};
		opacity: 0.25;
	}

	.react-grid-item > .react-resizable-handle {
		background-image: none;

		&::after {
			width: 6px;
			height: 6px;
			border-right: 2px solid ${(props: any) => props.theme.colors.gray[500]};
			border-bottom: 2px solid ${(props: any) => props.theme.colors.gray[500]};
			border-radius: 1px;
			right: 5px;
			bottom: 6px;
		}

		&.react-resizable-handle-se {
			right: -5px;
		}

		&.react-resizable-handle-sw {
			left: -5px;
			bottom: 1px;
		}

		&.react-resizable-handle-nw {
			left: -5px;
			top: -10px;
		}

		&.react-resizable-handle-ne {
			top: -10px;
			right: -5px;
		}
	}
`;

const NEW_TABLE_ID = 'new-table';

export const StackedTables = () => {
	const { appName, pageName } = useParams();

	const { isPreview } = useAtomValue(appModeAtom);
	const { tables, properties } = useGetPage({ appName, pageName });

	const [containerHeight, setContainerHeight] = useState<number | null>(null);

	const updateMutation = useUpdatePageData();

	useEffect(() => {
		const potentialContainerHeight =
			document.getElementById('table-container')?.getBoundingClientRect()?.height || 1000;

		setContainerHeight((potentialContainerHeight < 600 ? 600 : potentialContainerHeight) / 2);
	}, [isPreview]);

	const handleDragStart = () => {
		document.body.style.userSelect = 'none';
	};

	const handleDragEnd = () => {
		document.body.style.userSelect = 'initial';
	};

	const handleNewLayout = (newLayout: any) => {
		const filteredLayout = newLayout.filter((item: any) => item.i !== NEW_TABLE_ID);

		const tablesNeedUpdates = filteredLayout.filter((item: any) => {
			const table = tables?.find((t: any) => t.name === item.i);

			return (
				table.x !== item.x || table.y !== item.y || table.h !== item.h || table.w !== item.w
			);
		});

		const tableLayout = filteredLayout.reduce(
			(agg: any, item: any) => ({
				...agg,
				[item.i]: {
					x: item.x,
					y: item.y,
					h: item.h,
					w: item.w,
				},
			}),
			{},
		);

		if (tablesNeedUpdates.length > 0 && !updateMutation.isLoading) {
			updateMutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: properties?.blocks?.map((t: any) => {
						if (t.block_type === 'table') {
							return {
								...t,
								...(tableLayout?.[t.name] || {}),
							};
						}

						return t;
					}),
				},
			});
		}
	};

	const maxY = Math.max(...tables.map((t: any) => t.y));

	return (
		<StackedTableWrapper
			bg="white"
			spacing="2"
			px="4"
			py="2"
			h="full"
			overflowY="auto"
			overflowX="hidden"
			id="table-container"
			position="relative"
		>
			{updateMutation.isLoading ? (
				<Progress position="absolute" top="0" left="0" w="full" size="xs" isIndeterminate />
			) : null}

			{containerHeight ? (
				<ReactGridLayout
					className="layout"
					cols={4}
					rowHeight={containerHeight}
					preventCollision={false}
					isDraggable={!isPreview}
					isResizable={!isPreview}
					onDragStart={handleDragStart}
					onDragStop={handleDragEnd}
					onLayoutChange={handleNewLayout}
					draggableHandle=".react-grid-drag-handle"
				>
					{tables.map((table: any) => {
						return (
							<Box
								data-grid={{
									x: table?.x || 0,
									y: table?.y || 0,
									w: table?.w || 4,
									h: table?.h || 1,
									i: table?.name,
									resizeHandles: ['se', 'sw', 'ne', 'nw'],
								}}
								key={table.name}
							>
								<InspectorContainer
									flexShrink="0"
									h="full"
									w="full"
									type="table"
									id={table.name}
								>
									<SmartTable
										height={containerHeight * (table?.h || 1)}
										tableName={table.name}
									/>
								</InspectorContainer>
							</Box>
						);
					})}

					{isPreview ? null : (
						<Box
							data-grid={{
								x: 4,
								y: (maxY || 0) + 1,
								w: 1,
								h: 50 / containerHeight,
								i: NEW_TABLE_ID,
								isResizable: false,
								isDraggable: false,
							}}
							key={NEW_TABLE_ID}
						>
							<Box
								ml="auto"
								borderWidth="1px"
								borderStyle="dashed"
								p="2"
								h="full"
								borderRadius="md"
							>
								<NewTable h="full" w="full" variant="secondary" />
							</Box>
						</Box>
					)}
				</ReactGridLayout>
			) : null}
		</StackedTableWrapper>
	);
};
