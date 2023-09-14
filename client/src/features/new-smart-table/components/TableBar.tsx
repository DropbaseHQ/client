import { IconButton, Stack } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';

import { Save, Zap } from 'react-feather';
import { useConvertSmartTable, useCurrentTableData, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { pageAtom } from '@/features/new-page';
import { cellEditsAtom } from '@/features/new-smart-table/atoms';

import { FilterButton } from './Filters';
import { SortButton } from './Sorts';

export const TableBar = () => {
	const toast = useToast();
	const { tableId } = useAtomValue(pageAtom);

	const { rows, columns } = useCurrentTableData();

	const [cellEdits, setCellEdits] = useAtom(cellEditsAtom);

	const saveEditsMutation = useSaveEdits({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Cell edits saved',
			});
			setCellEdits([]);
		},
	});

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
	});

	const handleConvert = () => {
		if (tableId)
			convertMutation.mutate({
				tableId,
			});
	};

	const handleCellEdits = () => {
		if (tableId)
			saveEditsMutation.mutate({
				tableId,
				edits: cellEdits.map((edit: any) => ({
					row: rows[edit.rowIndex],
					column_name: edit.column_name,
					columns,
					old_value: edit.old_value,
					new_value: edit.new_value,
				})),
			});
	};

	return (
		<Stack
			bg="white"
			borderBottomWidth="1px"
			direction="row"
			p="1"
			justifyContent="space-between"
		>
			<Stack spacing="0" direction="row">
				<FilterButton />
				<SortButton />
			</Stack>

			<Stack direction="row">
				<IconButton
					aria-label="Convert to Smart table"
					icon={<Zap size="14" />}
					variant="ghost"
					colorScheme="yellow"
					size="sm"
					onClick={handleConvert}
					isLoading={convertMutation.isLoading}
				/>
				{cellEdits.length > 0 ? (
					<IconButton
						aria-label="Save Cell edits"
						icon={<Save size="14" />}
						variant="outline"
						colorScheme="blue"
						size="sm"
						onClick={handleCellEdits}
						isLoading={saveEditsMutation.isLoading}
					/>
				) : null}
			</Stack>
		</Stack>
	);
};
