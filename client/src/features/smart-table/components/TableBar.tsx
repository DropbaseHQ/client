import { IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { useAtom } from 'jotai';

import { Save } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCurrentTableData, useCurrentTableName, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { cellEditsAtom } from '@/features/smart-table/atoms';
import { getErrorMessage } from '@/utils';

import { FilterButton } from './Filters';
import { SortButton } from './Sorts';
import { PinnedFilters } from './PinnedFilters';
import { useGetTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';

export const TableBar = () => {
	const toast = useToast();

	const tableName = useCurrentTableName();

	const { file_id: fileId, type: tableType } = useGetTable(tableName || '');

	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.id === fileId);

	const { rows, columns } = useCurrentTableData(tableName);

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits[tableName] || [];

	const saveEditsMutation = useSaveEdits({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Cell edits saved',
			});
			setCellEdits((old: any) => ({
				...old,
				[tableName]: [],
			}));
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to save edits',
				description: getErrorMessage(error),
			});
		},
	});

	const handleCellEdits = () => {
		if (tableType === 'sql') {
			saveEditsMutation.mutate({
				file,
				edits: cellEdits.map((edit: any) => ({
					row: rows[edit.rowIndex],
					column_name: edit.column_name,
					columns,
					old_value: edit.old_value,
					new_value: edit.new_value,
				})),
			});
		}
	};

	if (tableType === 'sql') {
		return (
			<Stack
				bg="white"
				borderWidth="1px"
				borderRadius="sm"
				direction="row"
				p="1.5"
				justifyContent="space-between"
			>
				{tableType === 'sql' ? (
					<Stack spacing="0" alignItems="center" direction="row">
						<FilterButton />
						<SortButton />
						<PinnedFilters />
					</Stack>
				) : null}

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
	}

	return null;
};
