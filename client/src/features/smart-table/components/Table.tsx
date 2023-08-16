import { useParams } from 'react-router-dom';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useAtom } from 'jotai';
import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import { selectedRowAtom } from '@/features/app-builder/atoms/tableContextAtoms';

import { useTableData } from '../hooks/useTableData';

export const Table = () => {
	const { appId } = useParams();
	const { isLoading, rows, columns } = useTableData(appId);
	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
	});
	const [, setSelectedRow] = useAtom(selectedRowAtom);

	const handleSetSelection = (newSelection: any) => {
		const columnsAccessor: any = columns.reduce((agg, col) => {
			return {
				...agg,
				[col.name]: col,
			};
		}, {});

		setSelection(newSelection);

		const selectedRow = newSelection.rows.toArray()?.[0];
		setSelectedRow(
			Object.keys(rows[selectedRow])?.reduce((agg: any, field: string) => {
				const column: any = columnsAccessor?.[field];

				return {
					...agg,
					[column.folder]: {
						...(agg?.[column.folder] || {}),
						[column.table]: {
							...(agg[column.folder]?.[column.table] || {}),
							[field]: rows[selectedRow][field],
						},
					},
				};
			}, {}),
		);
	};

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

	const getCellContent = ([col, row]: any) => {
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

	const onCellEdited = (cell: any, newValue: any) => {
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
			onCellEdited={onCellEdited}
			gridSelection={selection}
			onGridSelectionChange={handleSetSelection}
		/>
	);
};
