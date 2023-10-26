import { useAtom } from 'jotai';
import {
	Box,
	Button,
	Center,
	Flex,
	Spinner,
	Stack,
	Text,
	Tooltip,
	useColorMode,
	useTheme,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { transparentize } from '@chakra-ui/theme-tools';
import { RefreshCw } from 'react-feather';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { selectedRowAtom } from '@/features/app-state';

import {
	CurrentTableContext,
	useCurrentTableData,
	useSyncDropbaseColumns,
	// useTableSyncStatus,
} from './hooks';

import { cellEditsAtom } from './atoms';
import { TableBar } from './components';
import { getPGColumnBaseType } from '@/utils';
import { useGetTable } from '@/features/app-builder/hooks';
import { NavLoader } from '@/components/Loader';

export const SmartTable = ({ tableId }: any) => {
	const theme = useTheme();
	const { colorMode } = useColorMode();

	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
		current: undefined,
	});

	const { isLoading, rows, columns, header } = useCurrentTableData(tableId);
	const { values, isLoading: isLoadingTable } = useGetTable(tableId || '');
	// const tableIsUnsynced = useTableSyncStatus(tableId);
	const syncMutation = useSyncDropbaseColumns();

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits?.[tableId] || [];

	const [selectedData, selectRow] = useAtom(selectedRowAtom);
	const selectedRow = (selectedData as any)?.[values.name];

	const [columnWidth, setColumnWidth] = useState<any>({});

	const tableName = values?.name;

	const onColumnResize = useCallback((col: any, newSize: any) => {
		setColumnWidth((c: any) => ({
			...c,
			[col.id]: newSize,
		}));
	}, []);

	useEffect(() => {
		const selectedIndex = rows.findIndex(
			(r: any) => JSON.stringify(r) === JSON.stringify(selectedRow),
		);

		if (selectedIndex !== -1 && selectedIndex !== selection.rows.toArray()[0]) {
			setSelection((old: any) => ({
				...old,
				rows: CompactSelection.fromSingleSelection([selectedIndex, selectedIndex + 1]),
			}));
		}
	}, [selectedRow, rows, selection]);

	useEffect(() => {
		setCellEdits((old: any) => ({
			...old,
			[tableId]: [],
		}));
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

	const visibleColumns = header.filter((columnName: any) => columns[columnName]?.visible);

	const gridColumns = visibleColumns.map((columnName: any) => {
		const column = columns[columnName];

		// ⚠️ only by passing undefined we can hide column icon
		let icon = column?.type ? GridColumnIcon.HeaderString : undefined;

		switch (getPGColumnBaseType(column?.type)) {
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
			width: columnWidth[column.name] || String(column.name).length * 10 + 35 + 30,
			icon,
		};

		if (column.editable) {
			return {
				...gridColumn,
			};
		}

		return gridColumn;
	});

	const getCellContent: any = ([col, row]: any) => {
		const currentRow = rows[row];
		const column = columns[visibleColumns[col]];

		const currentValue = currentRow?.[column?.name];

		const editedValue = cellEdits.find((e: any) => e.columnIndex === col && e.rowIndex === row)
			?.new_value;

		const defaultValue =
			currentValue === null || currentValue === undefined ? '' : String(currentValue);

		const cellValue = editedValue === undefined ? defaultValue : editedValue;

		const canEdit = column?.editable;

		let kind = GridCellKind.Text;

		let cellContent = {};

		if (column?.primary_key) {
			cellContent = {
				kind,
				data: String(cellValue),
				displayData: String(cellValue),
				allowOverlay: false,
				readonly: true,
			};
		}

		switch (getPGColumnBaseType(column?.type)) {
			case 'float':
			case 'integer': {
				kind = GridCellKind.Number;
				break;
			}

			default: {
				break;
			}
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

		const column = columns[visibleColumns[col]];

		if (column?.edit_keys?.length > 0) {
			setCellEdits((old: any) => ({
				...old,
				[tableId]: [
					...(old?.[tableId] || []),
					{
						new_value: newValue.data,
						value: currentRow[column.name],
						column_name: column.name,

						old_value: currentRow[column.name],
						rowIndex: row,
						columnIndex: col,
					},
				],
			}));
		}
	};

	const handleSetSelection = (newSelection: any) => {
		const rowSelected = newSelection?.rows?.toArray()?.[0];
		const cellSelected = newSelection?.current?.cell?.[1];

		const currentRow = typeof rowSelected === 'number' ? rowSelected : cellSelected;

		if (typeof currentRow === 'number') {
			setSelection({
				rows: CompactSelection.fromSingleSelection([currentRow, currentRow + 1]).add(
					newSelection.rows,
				),
				columns: newSelection.columns,
				current: newSelection.current,
			});

			const newSelectedRow = { [tableName]: rows[currentRow] } as any;

			selectRow((old: any) => ({
				...old,
				...newSelectedRow,
			}));
		}
	};
	const handleSyncColumns = () => {
		syncMutation.mutate({
			tableId,
			columns: header,
		});
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

	const memoizedContext = useMemo(() => ({ tableId }), [tableId]);

	return (
		<CurrentTableContext.Provider value={memoizedContext}>
			<Stack pos="relative" h="full" spacing="1">
				<NavLoader isLoading={isLoadingTable}>
					<Flex justifyContent="space-between">
						<Text flexShrink="0" px="2" fontWeight="semibold">
							{tableName}
						</Text>

						<Tooltip label="Sync columns">
							<Button
								colorScheme="yellow"
								size="sm"
								leftIcon={<RefreshCw size="14" />}
								onClick={handleSyncColumns}
								isLoading={syncMutation.isLoading}
							>
								Resync
							</Button>
						</Tooltip>
					</Flex>
				</NavLoader>
				<Stack spacing="2">
					<TableBar />
					<Box minH="72" borderWidth="1px" borderRadius="sm">
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
								onColumnResize={onColumnResize}
							/>
						)}
					</Box>
				</Stack>
			</Stack>
		</CurrentTableContext.Provider>
	);
};