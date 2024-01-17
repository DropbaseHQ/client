import { useAtom, useAtomValue } from 'jotai';
import {
	Box,
	Button,
	Center,
	Flex,
	IconButton,
	Spinner,
	Stack,
	Text,
	Tooltip,
	useColorMode,
	useTheme,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { transparentize } from '@chakra-ui/theme-tools';
import { Info, RotateCw, UploadCloud } from 'react-feather';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import { formatDate, formatTime, formatDateTime } from '@/features/smart-table/utils';
import { newPageStateAtom, selectedRowAtom, nonWidgetContextAtom } from '@/features/app-state';
import { SOCKET_URL } from '../app-preview';

import { CurrentTableContext, useCurrentTableData, useTableSyncStatus } from './hooks';

import {
	cellEditsAtom,
	hasSelectedRowAtom,
	tableColumnWidthAtom,
	tablePageInfoAtom,
} from './atoms';
import { TableBar } from './components';
import { getErrorMessage } from '@/utils';
import { useGetTable } from '@/features/app-builder/hooks';
import { NavLoader } from '@/components/Loader';

import { appModeAtom } from '@/features/app/atoms';
import { Pagination } from './components/Pagination';
import { DEFAULT_PAGE_SIZE } from './constants';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';

const heightMap: any = {
	'1/3': '3xs',
	'1/2': 'xs',
	full: '2xl',
};

export const SmartTable = ({ tableName }: any) => {
	const toast = useToast();
	const theme = useTheme();
	const { colorMode } = useColorMode();

	const { appName, pageName } = useParams();

	const { sendJsonMessage } = useWebSocket(SOCKET_URL, {
		share: true,
	});

	const pageState = useAtomValue(newPageStateAtom);
	const { isPreview } = useAtomValue(appModeAtom);

	const [allTableColumnWidth, setTableColumnWidth] = useAtom(tableColumnWidthAtom);
	const [tablesRowSelected, setTableRowSelection] = useAtom(hasSelectedRowAtom);

	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
		current: undefined,
	});

	const tableColumnWidth = allTableColumnWidth?.[tableName];

	const { properties } = useGetPage({ appName, pageName });

	const { isLoading, rows, columnDict, header, refetch, isRefetching, tableError, error } =
		useCurrentTableData(tableName);
	const {
		depends_on: dependsOn,
		isLoading: isLoadingTable,
		height,
		size,
		table,
	} = useGetTable(tableName || '');
	const tableIsUnsynced = useTableSyncStatus(tableName);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				title: 'Commited Columns details',
				status: 'success',
			});
		},
		onError: (err: any) => {
			toast({
				title: 'Failed to commit',
				status: 'error',
				description: getErrorMessage(err),
			});
		},
	});
	const [nonWidgetContext, setNonWidgetContext] = useAtom(nonWidgetContextAtom);
	const currentTableContext = nonWidgetContext?.tables?.[tableName];

	useEffect(() => {
		if (currentTableContext && currentTableContext?.reload) {
			refetch();
			setNonWidgetContext((old: any) => ({
				...old,
				tables: {
					...old.tables,
					[tableName]: {
						...old.tables[tableName],
						reload: false,
					},
				},
			}));
		}
	}, [currentTableContext, setNonWidgetContext, tableName, refetch]);

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits?.[tableName] || [];

	const [selectedData, selectRow] = useAtom(selectedRowAtom);
	const selectedRow = (selectedData as any)?.[tableName];

	const [allTablePageInfo, setPageInfo] = useAtom(tablePageInfoAtom);
	const pageInfo = allTablePageInfo[tableName] || {};

	const [columnWidth, setColumnWidth] = useState<any>(tableColumnWidth || {});

	const onColumnResize = useCallback(
		(col: any, newSize: any) => {
			setColumnWidth((c: any) => ({
				...c,
				[col.id]: newSize,
			}));

			setTableColumnWidth((old: any) => ({
				...old,
				[tableName]: {
					...(old?.[tableName] || {}),
					[col.id]: newSize,
				},
			}));
		},
		[setTableColumnWidth, tableName],
	);

	useEffect(() => {
		const selectedIndex = rows.findIndex(
			(r: any) => JSON.stringify(r) === JSON.stringify(selectedRow),
		);

		if (selectedIndex !== -1 && selectedIndex !== selection.rows.toArray()[0]) {
			setSelection((old: any) => ({
				...old,
				rows: CompactSelection.fromSingleSelection([selectedIndex, selectedIndex + 1]),
			}));
		}
	}, [selectedRow, rows, selection]);

	// only fill column width if the current state is empty
	useEffect(() => {
		setColumnWidth((curr: any) => {
			if (Object.keys(curr).length === 0 && tableColumnWidth) {
				return tableColumnWidth;
			}

			return curr;
		});
	}, [tableColumnWidth, setColumnWidth]);

	useEffect(() => {
		setCellEdits((old: any) => ({
			...old,
			[tableName]: [],
		}));
	}, [tableName, setCellEdits]);

	useEffect(() => {
		setPageInfo((old: any) => ({
			...old,
			[tableName]: {
				currentPage: 0,
				pageSize: size,
			},
		}));
	}, [tableName, size, setPageInfo]);

	const gridTheme =
		colorMode === 'dark'
			? {
					accentColor: theme.colors.blue['500'], // main blue
					accentLight: transparentize(theme.colors.blue['500'], 0.1)(theme), // cell selection highliths
					textDark: theme.colors.gray['300'], // cell color
					textLight: theme.colors.gray['500'], // colors of row id
					bgIconHeader: theme.colors.gray['700'], // icon box bg
					fgIconHeader: theme.colors.gray['50'], // icon color
					textHeader: theme.colors.gray['200'], // column cell color
					borderColor: theme.colors.gray['700'], // border color of cells
					bgHeaderHovered: theme.colors.gray['800'], // hovered color of header cells
					bgCell: theme.colors.gray['900'],
					bgHeader: theme.colors.gray['900'],
					bgHeaderHasFocus: theme.colors.gray['800'],
					bgBubble: theme.colors.gray['800'],
					bgBubbleSelected: theme.colors.blue['500'],
					textBubble: theme.colors.gray['600'],
					bgSearchResult: transparentize(theme.colors.yellow['500'], 0.2)(theme),
			  }
			: {
					accentColor: theme.colors.blue['500'], // main blue
					accentLight: transparentize(theme.colors.blue['500'], 0.1)(theme), // cell selection highliths
					textDark: theme.colors.gray['700'], // cell color
					textLight: theme.colors.gray['400'], // colors of row id
					bgIconHeader: theme.colors.gray['600'], // icon box bg
					fgIconHeader: theme.colors.gray['100'], // icon color
					textHeader: theme.colors.gray['600'], // column cell color
					borderColor: theme.colors.gray['100'], // border color of cells
					bgCell: theme.colors.white,
					bgHeader: theme.colors.white,
					bgHeaderHovered: theme.colors.gray['50'], // hovered color of header cells
					bgHeaderHasFocus: theme.colors.gray['100'], // hovered color of header cells
					bgBubble: theme.colors.gray['100'],
					bgSearchResult: transparentize(theme.colors.yellow['500'], 0.3)(theme),
			  };

	const visibleColumns = header.filter(
		(column: any) => !columnDict?.[column?.name] || columnDict[column?.name]?.visible,
	);

	const gridColumns = visibleColumns.map((column: any) => {
		const col = columnDict[column?.name] || column;

		// ⚠️ only by passing undefined we can hide column icon
		let icon = col?.display_type ? GridColumnIcon.HeaderString : undefined;

		switch (col?.display_type) {
			case 'integer': {
				icon = GridColumnIcon.HeaderNumber;
				break;
			}

			case 'float': {
				icon = GridColumnIcon.HeaderMath;
				break;
			}

			case 'date': {
				icon = GridColumnIcon.HeaderDate;
				break;
			}

			case 'time':
			case 'datetime': {
				icon = GridColumnIcon.HeaderTime;
				break;
			}

			case 'boolean': {
				icon = GridColumnIcon.HeaderBoolean;
				break;
			}
			default: {
				break;
			}
		}

		const gridColumn = {
			id: column.name,
			title: column.name,
			width: columnWidth[column.name] || String(column.name).length * 10 + 35 + 30,
			icon,
		};

		if (column.editable) {
			return {
				...gridColumn,
			};
		}

		if (!columnDict[column?.name]) {
			return {
				...gridColumn,
				themeOverride: {
					textDark: transparentize(theme.colors.gray['700'], 0.4)(theme),
					bgHeader: theme.colors.gray[50],
					textHeader: theme.colors.gray[400],
				},
			};
		}

		return gridColumn;
	});

	const getCellContent: any = ([col, row]: any) => {
		const currentRow = rows[row];
		const column = columnDict[visibleColumns[col]?.name] || visibleColumns[col];

		const currentValue = currentRow?.[column?.name];

		const editedValue = cellEdits.find((e: any) => e.columnIndex === col && e.rowIndex === row)
			?.new_value;

		const defaultValue =
			currentValue === null || currentValue === undefined ? '' : currentValue;

		const unParsedValue = editedValue === undefined ? defaultValue : editedValue;
		const stringifiedValue =
			typeof unParsedValue === 'object' && unParsedValue !== null
				? JSON.stringify(unParsedValue)
				: String(unParsedValue);
		const cellValue = stringifiedValue;
		const canEdit = column?.editable;

		if (column?.primary_key) {
			return {
				kind: GridCellKind.Text,
				data: String(cellValue),
				displayData: String(cellValue),
				allowOverlay: false,
				readonly: true,
				themeOverride: {
					bgCell: theme.colors.gray['50'],
				},
			};
		}

		const themeOverride = canEdit
			? {}
			: {
					themeOverride: {
						bgCell: theme.colors.gray['50'],
					},
			  };

		switch (column?.display_type) {
			case 'float':
			case 'integer': {
				return {
					kind: GridCellKind.Number,
					data: +cellValue,
					allowOverlay: canEdit,
					displayData: unParsedValue === null ? '' : cellValue,
					readonly: !canEdit,
					...themeOverride,
				};
			}

			case 'boolean': {
				const validType = typeof unParsedValue === 'boolean';

				return {
					kind: GridCellKind.Boolean,
					data: validType ? unParsedValue : undefined,
					allowOverlay: false,
					readonly: !canEdit,
					...themeOverride,
				};
			}

			case 'datetime': {
				return {
					kind: GridCellKind.Text,
					data: cellValue,
					allowOverlay: canEdit,
					displayData: formatDateTime(parseInt(cellValue, 10)),
					readonly: !canEdit,
					...themeOverride,
				};
			}

			case 'date': {
				return {
					kind: GridCellKind.Text,
					data: cellValue,
					allowOverlay: canEdit,
					displayData: formatDate(parseInt(cellValue, 10)),
					readonly: !canEdit,
					...themeOverride,
				};
			}

			case 'time': {
				return {
					kind: GridCellKind.Text,
					data: cellValue,
					allowOverlay: canEdit,
					displayData: formatTime(cellValue),
					readonly: !canEdit,
					...themeOverride,
				};
			}

			default: {
				return {
					kind: GridCellKind.Text,
					data: cellValue,
					allowOverlay: canEdit,
					displayData: String(cellValue),
					readonly: !canEdit,
					...themeOverride,
				};
			}
		}
	};

	const onCellEdited = (cell: any, newValue: any) => {
		const [col, row] = cell;
		const currentRow = rows[row];

		const column = columnDict[visibleColumns[col]?.name];

		if (column?.edit_keys?.length > 0) {
			setCellEdits((old: any) => {
				const hasCellEdit = (old?.[tableName] || []).find(
					(cellEdit: any) =>
						cellEdit.rowIndex === row && column.name === cellEdit.column_name,
				);

				if (hasCellEdit) {
					return {
						...old,
						[tableName]: (old?.[tableName] || []).map((cellEdit: any) => {
							if (cellEdit.rowIndex === row && column.name === cellEdit.column_name) {
								return {
									...cellEdit,
									new_value: newValue.data === undefined ? null : newValue.data,
								};
							}

							return cellEdit;
						}),
					};
				}

				return {
					...old,
					[tableName]: [
						...(old?.[tableName] || []),
						{
							new_value: newValue.data === undefined ? null : newValue.data,
							value: currentRow[column.name],
							column_name: column.name,

							old_value: currentRow[column.name],
							rowIndex: row,
							columnIndex: col,
						},
					],
				};
			});
		}
	};

	const onSelectionCleared = () => {
		setSelection({
			rows: CompactSelection.empty(),
			columns: CompactSelection.empty(),
			current: undefined,
		});

		const newSelectedRow = {
			[tableName]: Object.keys(selectedRow).reduce(
				(acc: { [col: string]: string | null }, curr: string) => ({ ...acc, [curr]: null }),
				{},
			),
		};

		selectRow((old: any) => ({
			...old,
			...newSelectedRow,
		}));

		setTableRowSelection((curr: any) => ({
			...curr,
			[tableName]: false,
		}));
		pageState.state.tables = newSelectedRow;
		sendJsonMessage({
			type: 'display_rule',
			state_context: pageState,
			app_name: appName,
			page_name: pageName,
		});
	};

	const handleSetSelection = (newSelection: any) => {
		const rowSelected = newSelection?.rows?.toArray()?.[0];
		const cellSelected = newSelection?.current?.cell?.[1];

		const currentRow = typeof rowSelected === 'number' ? rowSelected : cellSelected;

		if (typeof currentRow === 'number') {
			setSelection({
				rows: CompactSelection.fromSingleSelection([currentRow, currentRow + 1]).add(
					newSelection.rows,
				),
				columns: newSelection.columns,
				current: newSelection.current,
			});

			const newSelectedRow = { [tableName]: rows[currentRow] || {} } as any;

			selectRow((old: any) => ({
				...old,
				...newSelectedRow,
			}));

			setTableRowSelection((curr: any) => ({
				...curr,
				[tableName]: true,
			}));
			pageState.state.tables = newSelectedRow;
			sendJsonMessage({
				type: 'display_rule',
				state_context: pageState,
				app_name: appName,
				page_name: pageName,
			});
		} else {
			onSelectionCleared();
		}
	};

	const handleCommitColumns = () => {
		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				tables: [
					...(properties?.tables || []).map((t: any) => {
						if (t.name === tableName) {
							return {
								...t,
								columns: header.map((c: any) => ({
									...(columnDict?.[c] || {}),
									...c,
								})),
							};
						}

						return t;
					}),
				],
			},
		});
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

	const memoizedContext = useMemo(() => ({ tableName }), [tableName]);

	const errorMessage = tableError || error?.response?.data?.result?.error || error?.message;

	const dependantTablesWithNoRowSelection = (dependsOn || []).filter(
		(name: any) => !tablesRowSelected[name],
	);

	return (
		<CurrentTableContext.Provider value={memoizedContext}>
			<Stack pos="relative" h="full" spacing="1">
				<NavLoader isLoading={isLoadingTable}>
					<Flex justifyContent="space-between">
						<Stack spacing="0" px="2" flexShrink="0">
							<Text fontWeight="semibold">{table?.label || tableName}</Text>
							{dependantTablesWithNoRowSelection.length > 0 ? (
								<Stack direction="row" spacing="1" alignItems="center">
									<Box color="orange.500">
										<Info size="14" />
									</Box>
									<Text fontSize="xs">
										This table depends on{' '}
										<Box as="span" px=".5" fontWeight="semibold">
											{(dependsOn || []).join(', ')}
										</Box>
										. No row selection found for{' '}
										<Box as="span" fontWeight="semibold" color="orange.500">
											{dependantTablesWithNoRowSelection.join(', ')}
										</Box>
									</Text>
								</Stack>
							) : null}
						</Stack>

						<Stack alignItems="center" direction="row" spacing="2">
							<Tooltip label="Refresh data">
								<IconButton
									aria-label="Refresh Data"
									size="sm"
									colorScheme="gray"
									icon={<RotateCw size="14" />}
									variant="outline"
									isLoading={isRefetching}
									onClick={() => refetch()}
								/>
							</Tooltip>

							{!isLoading && !isPreview && tableIsUnsynced ? (
								<Tooltip label="Save columns">
									<Button
										variant="outline"
										colorScheme="gray"
										leftIcon={<UploadCloud size="14" />}
										size="sm"
										onClick={handleCommitColumns}
										isLoading={mutation.isLoading}
									>
										Save Columns
									</Button>
								</Tooltip>
							) : null}
						</Stack>
					</Flex>
				</NavLoader>

				<Stack spacing="2">
					<TableBar />
					<Box
						minH={heightMap[height] || '3xs'}
						borderWidth="1px"
						borderRadius="sm"
						contentEditable
					>
						{isLoading ? (
							<Center h="full" as={Stack}>
								<Spinner size="md" />
								<Text>Loading data...</Text>
							</Center>
						) : (
							<>
								{!isPreview && errorMessage ? (
									<Center as={Stack} spacing="0" p="6" h="full">
										<Text color="red.500" fontWeight="medium" fontSize="lg">
											Failed to load data
										</Text>
										<Text fontSize="md">
											{typeof errorMessage === 'object'
												? JSON.stringify(errorMessage)
												: errorMessage}
										</Text>
									</Center>
								) : (
									<DataEditor
										columns={gridColumns}
										rows={Math.min(
											rows.length,
											pageInfo.pageSize || DEFAULT_PAGE_SIZE,
										)}
										width="100%"
										height="100%"
										getCellContent={getCellContent}
										rowMarkers="both"
										smoothScrollX
										smoothScrollY
										theme={gridTheme}
										onGridSelectionChange={handleSetSelection}
										onSelectionCleared={onSelectionCleared}
										gridSelection={selection}
										highlightRegions={highlights}
										onCellEdited={onCellEdited}
										keybindings={{ search: true }}
										onColumnResize={onColumnResize}
									/>
								)}
							</>
						)}
					</Box>

					<Pagination />
				</Stack>
			</Stack>
		</CurrentTableContext.Provider>
	);
};
