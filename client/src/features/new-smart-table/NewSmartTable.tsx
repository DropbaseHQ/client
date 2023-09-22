import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	Badge,
	Box,
	Center,
	Spinner,
	Stack,
	Text,
	useColorMode,
	useTheme,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { transparentize } from '@chakra-ui/theme-tools';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { newSelectedRowAtom } from '@/features/new-app-state';
import { pageAtom } from '@/features/new-page';

import { useCurrentTableData } from './hooks';
import { cellEditsAtom } from './atoms';
import { TableBar } from './components';
import { useGetTable } from '@/features/new-app-builder/hooks';
import { PG_COLUMN_BASE_TYPE } from '@/utils';

export const NewSmartTable = () => {
	const theme = useTheme();
	const { colorMode } = useColorMode();

	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
		current: undefined,
	});

	const { tableId } = useAtomValue(pageAtom);

	const { isLoading, rows, columns, header, tableName } = useCurrentTableData();
	const { values, isLoading: isLoadingTableData } = useGetTable(tableId || '');

	const sqlCode = (values?.code || '').trim();

	const [cellEdits, setCellEdits] = useAtom(cellEditsAtom);

	const selectRow = useSetAtom(newSelectedRowAtom);

	useEffect(() => {
		setCellEdits([]);
	}, [tableId, setCellEdits]);

	const gridTheme =
		colorMode === 'dark'
			? {
					accentColor: theme.colors.blue['500'], // main blue
					accentLight: transparentize(theme.colors.blue['500'], 0.1)(theme), // cell selection highliths
					textDark: theme.colors.gray['300'], // cell color
					textLight: theme.colors.gray['500'], // colors of row id
					bgIconHeader: theme.colors.gray['700'], // icon box bg
					fgIconHeader: theme.colors.gray['50'], // icon color
					textHeader: theme.colors.gray['200'], // column cell color
					borderColor: theme.colors.gray['700'], // border color of cells
					bgHeaderHovered: theme.colors.gray['800'], // hovered color of header cells
					bgCell: theme.colors.gray['900'],
					bgHeader: theme.colors.gray['900'],
					bgHeaderHasFocus: theme.colors.gray['800'],
					bgBubble: theme.colors.gray['800'],
					bgBubbleSelected: theme.colors.blue['500'],
					textBubble: theme.colors.gray['600'],
					bgSearchResult: transparentize(theme.colors.yellow['500'], 0.2)(theme),
			  }
			: {
					accentColor: theme.colors.blue['500'], // main blue
					accentLight: transparentize(theme.colors.blue['500'], 0.1)(theme), // cell selection highliths
					textDark: theme.colors.gray['700'], // cell color
					textLight: theme.colors.gray['400'], // colors of row id
					bgIconHeader: theme.colors.gray['600'], // icon box bg
					fgIconHeader: theme.colors.gray['100'], // icon color
					textHeader: theme.colors.gray['600'], // column cell color
					borderColor: theme.colors.gray['100'], // border color of cells
					bgCell: theme.colors.white,
					bgHeader: theme.colors.white,
					bgHeaderHovered: theme.colors.gray['50'], // hovered color of header cells
					bgHeaderHasFocus: theme.colors.gray['100'], // hovered color of header cells
					bgBubble: theme.colors.gray['100'],
					bgSearchResult: transparentize(theme.colors.yellow['500'], 0.3)(theme),
			  };

	const gridColumns = header
		.filter((columnName: any) => columns[columnName]?.visible)
		.map((columnName: any) => {
			let icon = GridColumnIcon.HeaderString;

			const column = columns[columnName];

			switch (PG_COLUMN_BASE_TYPE[column?.type]) {
				case 'integer': {
					icon = GridColumnIcon.HeaderNumber;
					break;
				}

				case 'float': {
					icon = GridColumnIcon.HeaderMath;
					break;
				}

				case 'date': {
					icon = GridColumnIcon.HeaderDate;
					break;
				}

				case 'time':
				case 'datetime': {
					icon = GridColumnIcon.HeaderTime;
					break;
				}

				case 'boolean': {
					icon = GridColumnIcon.HeaderBoolean;
					break;
				}
				default: {
					break;
				}
			}

			const gridColumn = {
				id: column.name,
				title: column.name,
				width: String(column.name).length * 10 + 35 + 30,
				icon,
			};

			if (column.editable) {
				return {
					...gridColumn,
					themeOverride: {
						bgHeader: theme.colors.yellow['50'],
						bgHeaderHovered: theme.colors.yellow['100'],
						bgHeaderHasFocus: theme.colors.yellow['100'],
					},
				};
			}

			return gridColumn;
		});

	const getCellContent: any = ([col, row]: any) => {
		const currentRow = rows[row];
		const column = columns[header[col]];

		const currentValue = currentRow?.[column.name];

		const editedValue = cellEdits.find((e: any) => e.columnIndex === col && e.rowIndex === row)
			?.new_value;

		const defaultValue =
			currentValue === null || currentValue === undefined ? '' : String(currentValue);

		const cellValue = editedValue === undefined ? defaultValue : editedValue;

		const canEdit = column?.editable;

		let kind = GridCellKind.Text;

		let cellContent = {};

		if (column.primary_key) {
			cellContent = {
				kind,
				data: String(cellValue),
				displayData: String(cellValue),
				allowOverlay: false,
				readonly: true,
			};
		}

		if (column.type === 'integer') {
			kind = GridCellKind.Number;
		}

		cellContent = {
			kind,
			data: currentValue,
			allowOverlay: canEdit,
			displayData: String(cellValue),
			readonly: !canEdit,
		};

		if (canEdit) {
			return {
				...cellContent,
			};
		}

		return {
			...cellContent,

			themeOverride: {
				bgCell: theme.colors.gray['50'],
			},
		};
	};

	const onCellEdited = (cell: any, newValue: any) => {
		const [col, row] = cell;
		const currentRow = rows[row];

		const column = columns[header[col]];

		if (column?.edit_keys?.length > 0) {
			setCellEdits((e: any) => [
				...e,
				{
					new_value: newValue.data,
					value: currentRow[column.name],
					column_name: column.name,

					old_value: currentRow[column.name],
					rowIndex: row,
					columnIndex: col,
				},
			]);
		}
	};

	const handleSetSelection = (newSelection: any) => {
		const currentRow = newSelection?.rows?.toArray()?.[0] || newSelection?.current?.cell?.[1];

		if (typeof currentRow === 'number') {
			setSelection({
				rows: CompactSelection.fromSingleSelection([currentRow, currentRow + 1]).add(
					newSelection.rows,
				),
				columns: newSelection.columns,
				current: newSelection.current,
			});
			selectRow({ [tableName]: rows[currentRow] } as any);
		}
	};

	const highlights: any = cellEdits.map((edit: any) => {
		return {
			color: '#eaeaea',
			range: {
				x: edit.columnIndex,
				y: edit.rowIndex,
				width: 1,
				height: 1,
			},
			style: 'solid',
		};
	});

	return (
		<Box w="full" h="full" display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap="1%">
			<Stack direction="row" textAlign="left" w="98%">
				<Text mt="0.5" fontSize="10.5pt" fontWeight="semibold">{tableName}</Text>
			</Stack>
			<Box borderWidth='1px' w="98%" h="90%">
				<Stack pos="relative" h="full" spacing="0">
					<TableBar />
					{isLoading ? (
						<Center h="full" as={Stack}>
							<Spinner size="md" />
							<Text>Loading data...</Text>
						</Center>
					) : (
						<DataEditor
							columns={gridColumns}
							rows={rows.length}
							width="100%"
							height="100%"
							getCellContent={getCellContent}
							rowMarkers="both"
							smoothScrollX
							smoothScrollY
							theme={gridTheme}
							onGridSelectionChange={handleSetSelection}
							gridSelection={selection}
							highlightRegions={highlights}
							onCellEdited={onCellEdited}
							keybindings={{ search: true }}
						/>
					)}

					{/* {!sqlCode && !isLoadingTableData ? (
						<Alert
							borderRadius="md"
							w="fit-content"
							position="absolute"
							right={2}
							bottom={2}
							shadow="xs"
							status="warning"
							variant="top-accent"
							borderTopWidth="3px"
						>
							<AlertIcon />
							<AlertDescription>Connect source to view data</AlertDescription>
						</Alert>
					) : null} */}
				</Stack>
			</Box>
		</Box>
	);
};
