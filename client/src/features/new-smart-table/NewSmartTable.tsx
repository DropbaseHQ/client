import { useSetAtom } from 'jotai';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { useTableData } from './hooks/useTableData';
import { newSelectedRow } from '@/features/new-app-state';

export const NewSmartTable = () => {
	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
	});

	const { isLoading, rows, columns, header, tableName } = useTableData({
		tableId: 'b37ba8d3-6f5f-47a0-9d98-d749ccb8d4a2',
	});

	const selectRow = useSetAtom(newSelectedRow);

	const gridColumns = header.map((columnName: any) => {
		let icon = GridColumnIcon.HeaderString;

		const column = columns[columnName];

		console.log('COLUMN');
		console.log(column);

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

		const cellValue =
			currentValue === null || currentValue === undefined ? '' : String(currentValue);

		const canEdit = column.editable;

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

	const handleSetSelection = (newSelection: any) => {
		const selectedRow = newSelection.rows.toArray()?.[0];

		setSelection(newSelection);

		selectRow(
			typeof selectedRow === 'number'
				? ({ [tableName]: { ...rows[selectedRow] } } as any)
				: {},
		);
	};

	return (
		<Stack h="full" spacing="0">
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
				/>
			)}
		</Stack>
	);
};
