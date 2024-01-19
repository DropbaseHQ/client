import {
	Box,
	Button,
	ButtonGroup,
	IconButton,
	Popover,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Stack,
	Tooltip,
	useDisclosure,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';

import { Save, Zap } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCurrentTableData, useCurrentTableName, useSaveEdits } from '../hooks';
import { useToast } from '@/lib/chakra-ui';
import { cellEditsAtom } from '@/features/smart-table/atoms';
import { getErrorMessage } from '@/utils';

import { FilterButton } from './Filters';
import { SortButton } from './Sorts';
import { PinnedFilters } from './PinnedFilters';
import { useConvertSmartTable, useGetTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { newPageStateAtom } from '@/features/app-state';
import { appModeAtom } from '@/features/app/atoms';

export const TableBar = () => {
	const toast = useToast();

	const tableName = useCurrentTableName();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const { isPreview } = useAtomValue(appModeAtom);
	const { fetcher, type: tableType, smart: isSmartTable, table } = useGetTable(tableName || '');

	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.name === fetcher);

	const { rows, columns } = useCurrentTableData(tableName);

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits[tableName] || [];

	const pageState = useAtomValue(newPageStateAtom);

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to convert table',
				description: getErrorMessage(error),
			});
		},
	});

	const handleConvert = () => {
		convertMutation.mutate({
			table,
			state: pageState.state,
			appName,
			pageName,
		});
	};

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
									>
										<FilterButton />
										<SortButton />
									</Stack>
								</PopoverTrigger>
								<PopoverContent zIndex="popover" mt="-2">
									<PopoverHeader fontWeight="semibold">
										Convert to Smart Table
									</PopoverHeader>

									<PopoverCloseButton size="xs" />
									<PopoverBody fontSize="sm">
										Convert to smart table to enable filter, sorts and editing
										cells
									</PopoverBody>
									<PopoverFooter display="flex" justifyContent="flex-end">
										<ButtonGroup size="sm">
											<Button
												isLoading={convertMutation.isLoading}
												onClick={handleConvert}
												colorScheme="gray"
												variant="outline"
												leftIcon={<Zap size="14" />}
											>
												Convert to Smart Table
											</Button>
										</ButtonGroup>
									</PopoverFooter>
								</PopoverContent>
							</Popover>
						</Box>

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
