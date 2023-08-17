import { useParams } from 'react-router-dom';
import { Button, Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useMutation } from 'react-query';
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
import { axios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';

const saveEdits = async ({ edits, sqlId }: { edits: any; sqlId: any }) => {
	const response = await axios.post(`/task/edit`, { sql_id: sqlId, edits });
	return response.data;
};

export const Table = () => {
	const { appId } = useParams();
	const toast = useToast();
	const { isLoading, rows, columns, rowsWithSchema, schema, sqlId, refetch } =
		useTableData(appId);
	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
	});
	const [, setSelectedRow] = useAtom(selectedRowAtom);

	const [cellEdits, setCellEdits] = useState<any>([]);

	const editMutation = useMutation(saveEdits, {
		onSuccess: () => {
			setCellEdits([]);
			toast({
				title: 'Edited successfully',
				status: 'success',
			});
			refetch();
		},
		onError: () => {
			toast({
				title: 'Failed to edit cells',
				status: 'error',
			});
		},
	});
	const handleSetSelection = (newSelection: any) => {
		setSelection(newSelection);

		const selectedRow = newSelection.rows.toArray()?.[0];

		setSelectedRow(typeof selectedRow === 'number' ? rowsWithSchema[selectedRow] : {});
	};

	if (isLoading) {
		return (
			<Center h="full" as={Stack}>
				<Spinner size="md" />
				<Text>Loading data...</Text>
			</Center>
		);
	}

	const displayColumns = columns.filter(({ hidden }: any) => !hidden);

	const gridColumns = displayColumns.map((column: any) => {
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
		const currentRow = rowsWithSchema[row];
		const column = displayColumns[col];

		const currentValue = currentRow?.[column.folder]?.[column?.table]?.[column.name];

		const editedValue = cellEdits.find((e: any) => e.columnIndex === col && e.rowIndex === row)
			?.new_value;

		const defaultValue =
			currentValue === null || currentValue === undefined ? '' : String(currentValue);

		const cellValue = editedValue === undefined ? defaultValue : editedValue;

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
			allowOverlay: canEdit,
			displayData: cellValue,
			readonly: !canEdit,
		};
	};

	const onCellEdited = (cell: any, newValue: any) => {
		const [col, row] = cell;
		const currentRow = rowsWithSchema[row];

		const column = columns[col];

		const tableSchema = schema?.[column.folder]?.[column.table];

		const tablePrimaryKey = Object.keys(tableSchema)?.find((id) => tableSchema[id].primary_key);

		if (tablePrimaryKey) {
			setCellEdits((e: any) => [
				...e,
				{
					column_name: column.name,
					table_name: column.table,
					schema_name: column.folder,
					new_value: newValue.data,
					value: currentRow?.[column.folder]?.[column.table]?.[column.name],

					key_column_name: tablePrimaryKey,
					key_column_value:
						currentRow?.[column.folder]?.[column.table]?.[tablePrimaryKey],

					rowIndex: row,
					columnIndex: col,
				},
			]);
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
		<Stack h="full">
			<Stack
				direction="row"
				px="2"
				borderBottomWidth="1px"
				justifyContent="end"
				alignItems="center"
				h="14"
			>
				<Button
					variant="solid"
					colorScheme="blue"
					isDisabled={cellEdits.length === 0}
					isLoading={editMutation.isLoading}
					onClick={() => {
						editMutation.mutate({
							edits: cellEdits,
							sqlId,
						});
					}}
					size="sm"
				>
					Save
				</Button>
			</Stack>
			<DataEditor
				columns={gridColumns}
				rows={rows.length}
				width="100%"
				height="100%"
				getCellContent={getCellContent}
				rowMarkers="both"
				smoothScrollX
				smoothScrollY
				highlightRegions={highlights}
				onCellEdited={onCellEdited}
				gridSelection={selection}
				onGridSelectionChange={handleSetSelection}
			/>
		</Stack>
	);
};
