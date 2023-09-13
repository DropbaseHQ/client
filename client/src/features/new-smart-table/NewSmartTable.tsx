import { useAtomValue, useSetAtom } from 'jotai';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { useTableData } from './hooks';
import { newSelectedRowAtom } from '@/features/new-app-state';
import { TableBar } from './components';
import { pageAtom } from '@/features/new-page';

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

	const selectRow = useSetAtom(newSelectedRowAtom);

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
				/>
			)}
		</Stack>
	);
};
