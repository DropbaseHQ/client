import {
	Box,
	IconButton,
	Popover,
	PopoverTrigger,
	Spinner,
	Stack,
	Tooltip,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';

import { useIsMutating } from 'react-query';

import { Save } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCurrentTableData, useCurrentTableName, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { cellEditsAtom } from '@/features/smart-table/atoms';
import { getErrorMessage } from '@/utils';

import { FilterButton } from './Filters';
import { SortButton } from './Sorts';
import { PinnedFilters } from './PinnedFilters';
import { CONVERT_MUTATION, useGetTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';

import { appModeAtom } from '@/features/app/atoms';
import { useConvertPopover } from '@/features/smart-table/hooks/useConvertPopover';
import { WidgetPreview } from '@/features/app-preview/WidgetPreview';

export const TableBar = () => {
	const toast = useToast();

	const tableName = useCurrentTableName();

	const { onOpen, onClose, isOpen, renderPopoverContent } = useConvertPopover(tableName);

	const { isPreview } = useAtomValue(appModeAtom);
	const {
		widget: tableWidget,
		fetcher,
		type: tableType,
		smart: isSmartTable,
	} = useGetTable(tableName || '');

	const isConvertingTable = useIsMutating({ mutationKey: `${CONVERT_MUTATION}-${tableName}` });

	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.name === fetcher?.value);

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
					columns: columns.filter((c: any) => c?.column_type !== 'button_column'),
					data_type: edit.data_type,
					old_value: edit.old_value,
					new_value: edit.new_value,
				})),
			});
		}
	};

	if (tableWidget) {
		return (
			<Stack
				bg="white"
				borderWidth="1px"
				borderBottom="0"
				borderTopLeftRadius="md"
				borderTopRightRadius="md"
				direction="row"
				flexWrap="wrap"
				alignItems="center"
				p="2"
				w="full"
				justifyContent="space-between"
			>
				<WidgetPreview inline widgetName={tableWidget} />
			</Stack>
		);
	}

	if (tableType === 'sql') {
		return (
			<Stack
				bg="white"
				borderWidth="1px"
				borderBottom="0"
				borderTopLeftRadius="md"
				borderTopRightRadius="md"
				direction="row"
				p="2"
				alignItems="center"
				justifyContent="space-between"
			>
				{tableType === 'sql' ? (
					<Stack spacing="0" alignItems="center" direction="row">
						<Box onMouseLeave={onClose}>
							<Popover
								returnFocusOnClose={false}
								isOpen={!isPreview && !isSmartTable && fetcher && isOpen}
								onClose={onClose}
								placement="bottom-end"
								closeOnBlur={false}
							>
								<PopoverTrigger>
									<Stack
										onMouseOver={onOpen}
										onMouseEnter={onOpen}
										direction="row"
										mr="3"
									>
										<FilterButton />
										<SortButton />
									</Stack>
								</PopoverTrigger>
								{renderPopoverContent()}
							</Popover>
						</Box>

						<PinnedFilters />
					</Stack>
				) : null}

				<Stack direction="row">
					{isConvertingTable ? (
						<Tooltip label="Converting to Smart Table">
							<Spinner mr="2" emptyColor="gray.200" color="yellow.500" size="sm" />
						</Tooltip>
					) : null}
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
