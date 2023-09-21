import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Center, Spinner, Stack, Text, useColorMode, useTheme } from '@chakra-ui/react';
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
import { TableProperties } from '@/features/new-app-builder/components/PropertiesEditor/TableProperties';

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

	const gridColumns = header
		.filter((columnName: any) => columns[columnName]?.visible)
		.map((columnName: any) => {
			let icon = GridColumnIcon.HeaderString;

			const column = columns[columnName];

			switch (column?.type) {
				case 'integer': {
					icon = GridColumnIcon.HeaderNumber;
					break;
				}
				default: {
					break;
				}
			}

			return {
				id: column.name,
				title: column.name,
				width: String(column.name).length * 10 + 35 + 30,
				icon,
			};
		});

	const getCellContent = ([col, row]: any) => {
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

		if (column.primary_key) {
			return {
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

		return {
			kind,
			data: currentValue,
			allowOverlay: canEdit,
			displayData: String(cellValue),
			readonly: !canEdit,
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
					bgHeaderHovered: theme.colors.gray['100'], // hovered color of header cells
					bgHeaderHasFocus: theme.colors.gray['100'], // hovered color of header cells
					bgBubble: theme.colors.gray['100'],
					bgSearchResult: transparentize(theme.colors.yellow['500'], 0.3)(theme),
			  };

	if (isLoading || isLoadingTableData) {
		return (
			<Stack h="full" spacing="0">
				<TableBar />

				<Center h="full" as={Stack}>
					<Spinner size="md" />
					<Text>Loading data...</Text>
				</Center>
			</Stack>
		);
	}

	if (!sqlCode) {
		return (
			<Center h="full">
				<Stack p={6} w="container.sm" spacing="2.5" alignItems="center">
					<Text fontWeight="semibold">Connect source to view table data.</Text>
					<Stack
						p={6}
						bg="white"
						w="full"
						borderRadius="sm"
						borderWidth="1px"
						spacing="0"
					>
						<TableProperties />
					</Stack>
				</Stack>
			</Center>
		);
	}

	return (
		<Stack h="full" spacing="0">
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
		</Stack>
	);
};
