import { useParams } from 'react-router-dom';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import '@glideapps/glide-data-grid/dist/index.css';

import DataEditor, {
	CompactSelection,
	EditableGridCell,
	GridCell,
	GridCellKind,
	GridColumnIcon,
	Item,
} from '@glideapps/glide-data-grid';

import { useTableData } from '../hooks/useTableData';

export const Table = () => {
	const { appId } = useParams();
	const { isLoading, rows, columns } = useTableData(appId);
	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
	});

	if (isLoading) {
		return (
			<Center h="full" as={Stack}>
				<Spinner size="md" />
				<Text>Loading data...</Text>
			</Center>
		);
	}

	const displayColumns = columns.filter(({ hidden }) => !hidden);

	const gridColumns = displayColumns.map((column) => {
		let icon = GridColumnIcon.HeaderString;

		switch (column.type) {
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

	const getCellContent = ([col, row]: Item): GridCell => {
		const currentRow = rows[row];
		const column = displayColumns[col];

		const currentValue = currentRow?.[column.name];

		const cellValue =
			currentValue === null || currentValue === undefined ? '' : String(currentValue);
		const canEdit = column.editable;

		let kind = GridCellKind.Text;

		if (column.primary_key) {
			return {
				kind,
				data: String(cellValue),
				displayData: cellValue,
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
			allowOverlay: true || canEdit,
			displayData: cellValue,
			readonly: false && !canEdit,
		};
	};

	const onCellEdited = (cell: Item, newValue: EditableGridCell) => {
		const [col, row] = cell;
		const currentRow = rows[row];
		const column = columns[col];

		console.log(column, currentRow, newValue);
	};

	return (
		<DataEditor
			columns={gridColumns}
			rows={rows.length}
			width="100%"
			height="100%"
			getCellContent={getCellContent}
			rowMarkers="both"
			smoothScrollX
			smoothScrollY
			rowSelectionMode="multi"
			onCellEdited={onCellEdited}
			gridSelection={selection}
			onGridSelectionChange={setSelection}
		/>
	);
};
