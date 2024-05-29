import { IconButton, Tooltip } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';

import { Save } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCurrentTableData, useCurrentTableName, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

import { pageStateAtom } from '@/features/app-state';
import { cellEditsAtom } from '@/features/smart-table/atoms';

export const SaveEditsButton = () => {
	const toast = useToast();

	const tableName = useCurrentTableName();

	const { appName, pageName } = useParams();

	const { rows } = useCurrentTableData(tableName);

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

	const pageState: any = useAtomValue(pageStateAtom);
	const pageStateRef = useRef(pageState);

	pageStateRef.current = pageState;

	const handleCellEdits = () => {
		const groupedEdits: Record<number, any> = {};

		cellEdits.forEach((edit: any) => {
			const { rowIndex, column_name: columnName, new_value: newValue } = edit;
			if (!groupedEdits[rowIndex]) {
				groupedEdits[rowIndex] = {
					old: { ...rows[rowIndex] },
					new: { ...rows[rowIndex] },
				};
			}
			groupedEdits[rowIndex].new[columnName] = newValue;
		});

		const editsToSend: any[] = Object.values(groupedEdits);

		saveEditsMutation.mutate({
			appName,
			pageName,
			resource: tableName,
			state: pageStateRef.current,
			rowEdits: editsToSend,
		});
	};

	if (cellEdits.length > 0) {
		return (
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
		);
	}

	return null;
};
