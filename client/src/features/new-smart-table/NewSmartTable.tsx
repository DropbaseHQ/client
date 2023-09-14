import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { newSelectedRowAtom } from '@/features/new-app-state';
import { pageAtom } from '@/features/new-page';

import { useTableData } from './hooks';
import { cellEditsAtom } from './atoms';
import { TableBar } from './components';

export const NewSmartTable = () => {
	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
		current: undefined,
	});

	const { tableId } = useAtomValue(pageAtom);

	const { isLoading, rows, columns, header, tableName } = useTableData({
		tableId,
	});

	const [cellEdits, setCellEdits] = useAtom(cellEditsAtom);

	const selectRow = useSetAtom(newSelectedRowAtom);

	useEffect(() => {
		setCellEdits([]);
	}, [tableId, setCellEdits]);

	const gridColumns = header.map((columnName: any) => {
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

		const canEdit = column?.edit_keys?.length > 0;

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
					onGridSelectionChange={handleSetSelection}
					gridSelection={selection}
					highlightRegions={highlights}
					onCellEdited={onCellEdited}
				/>
			)}
		</Stack>
	);
};
