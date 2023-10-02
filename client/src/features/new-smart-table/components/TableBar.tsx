import { IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { useAtom } from 'jotai';

import { Save } from 'react-feather';
import { useCurrentTableData, useCurrentTableId, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { cellEditsAtom } from '@/features/new-smart-table/atoms';

import { FilterButton } from './Filters';
import { SortButton } from './Sorts';
import { PinnedFilters } from './PinnedFilters';

export const TableBar = () => {
	const toast = useToast();

	const tableId = useCurrentTableId();

	const { rows, columns } = useCurrentTableData(tableId);

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits[tableId] || [];

	const saveEditsMutation = useSaveEdits({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Cell edits saved',
			});
			setCellEdits((old: any) => ({
				...old,
				[tableId]: [],
			}));
		},
	});

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
			borderWidth="1px"
			borderRadius="sm"
			direction="row"
			p="1.5"
			justifyContent="space-between"
		>
			<Stack spacing="0" alignItems="center" direction="row">
				<FilterButton />
				<SortButton />
				<PinnedFilters />
			</Stack>

			<Stack direction="row">
				{cellEdits.length > 0 ? (
					<Tooltip label="Update">
						<IconButton
							aria-label="Save Cell edits"
							icon={<Save size="14" />}
							variant="outline"
							colorScheme="blue"
							size="sm"
							onClick={handleCellEdits}
							isLoading={saveEditsMutation.isLoading}
						/>
					</Tooltip>
				) : null}
			</Stack>
		</Stack>
	);
};
