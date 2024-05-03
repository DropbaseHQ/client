import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
	Box,
	Button,
	Center,
	IconButton,
	Popover,
	PopoverTrigger,
	Progress,
	Skeleton,
	Stack,
	Text,
	Tooltip,
	useColorMode,
	usePrevious,
	useTheme,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { transparentize } from '@chakra-ui/theme-tools';
import { Info, Move, RotateCw, UploadCloud } from 'react-feather';

import DataEditor, {
	CompactSelection,
	GridCellKind,
	GridColumnIcon,
} from '@glideapps/glide-data-grid';
import {
	DatePickerCell,
	MultiSelectCell,
	ButtonCell,
	SparklineCell,
	TagsCell,
	SpinnerCell,
} from '@glideapps/glide-data-grid-cells';
import '@glideapps/glide-data-grid/dist/index.css';

import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import {
	formatDate,
	formatTime,
	formatDateTime,
	getEpochFromTimeString,
	getTimeStringFromEpoch,
	getDateInstance,
} from '@/features/smart-table/utils';
import { pageStateContextAtom, pageContextAtom, pageStateAtom } from '@/features/app-state';

import dropdownCellRenderer from './components/cells/SingleSelect';

import {
	CurrentTableContext,
	useCurrentTableData,
	useSaveColumns,
	useTableSyncStatus,
} from './hooks';

import {
	cellEditsAtom,
	hasSelectedRowAtom,
	tableColumnWidthAtom,
	tablePageInfoAtom,
} from './atoms';
import { extractTemplateString, getErrorMessage } from '@/utils';
import { useGetTable } from '@/features/app-builder/hooks';
import { NavLoader } from '@/components/Loader';

import { appModeAtom } from '@/features/app/atoms';
import { DEFAULT_PAGE_SIZE } from './constants';
import { useToast } from '@/lib/chakra-ui';
import { LabelContainer } from '@/components/LabelContainer';
import { useEvent } from '@/features/app-preview/hooks';
import { useConvertPopover } from '@/features/smart-table/hooks/useConvertPopover';
import { useGetWebSocketURL } from '../authorization/hooks/useLogin';
import { Notification } from '@/features/app-preview/components/Notification';
import { ACTIONS } from '@/constant';
import { ComponentsPreview } from '@/features/smart-table/components/ComponentsPreview';
import { SaveEditsButton } from '@/features/smart-table/components/SaveEditsButton';
import { useGetPage } from '@/features/page';
import { DeleteRowButton } from '@/features/smart-table/components/DeleteRowButton';

const ALL_CELLS = [
	DatePickerCell,
	dropdownCellRenderer,
	MultiSelectCell,
	ButtonCell,
	SparklineCell,
	TagsCell,
	SpinnerCell,
];

export const SmartTable = ({ tableName, height }: any) => {
	const toast = useToast();
	const theme = useTheme();
	const { colorMode } = useColorMode();

	const [buttonTrigger, setButtonTrigger] = useState<any>(null);

	const { appName, pageName } = useParams();

	const websocketURL = useGetWebSocketURL();

	const { sendJsonMessage } = useWebSocket(websocketURL, {
		share: true,
	});

	const pageStateContext: any = useAtomValue(pageStateContextAtom);
	const setPageContext = useSetAtom(pageContextAtom);
	const { isPreview } = useAtomValue(appModeAtom);

	const currentTableContext = pageStateContext?.context?.[tableName];

	const [allTableColumnWidth, setTableColumnWidth] = useAtom(tableColumnWidthAtom);
	const [tablesRowSelected, setTableRowSelection] = useAtom(hasSelectedRowAtom);

	const [selection, setSelection] = useState({
		rows: CompactSelection.empty(),
		columns: CompactSelection.empty(),
		current: undefined,
	});

	const tableColumnWidth = allTableColumnWidth?.[tableName];

	const {
		renderPopoverContent,
		onOpen: openConvertPopover,
		onClose: closeConvertPopover,
		isOpen: convertPopoverOpen,
	} = useConvertPopover(tableName);

	const {
		isLoading,
		rows,
		columnDict,
		header,
		refetch,
		isRefetching,
		tableError,
		error,
		remove: removeQuery,
	} = useCurrentTableData(tableName);

	const {
		depends_on: dependsOn,
		isLoading: isLoadingTable,
		size,
		table,
	} = useGetTable(tableName || '');

	const { availableMethods } = useGetPage({ appName, pageName });

	const [tableHeaderHeight, setTableHeaderHeight] = useState<any>();
	const tableHeaderRef: any = useRef();

	const [tableBarHeight, setTableBarHeight] = useState<any>();
	const tableBarRef: any = useRef();

	const pageBarRef: any = useRef();
	const [pageBarHeight, setPageBarHeight] = useState<any>();

	const tableIsUnsynced = useTableSyncStatus(tableName);

	const currentFetcher = table?.fetcher;
	const previousFetcher = usePrevious(currentFetcher);

	const { handleEvent } = useEvent({
		onSuccess: () => {
			setButtonTrigger(null);
		},
		onError: () => {
			setButtonTrigger(null);
		},
	});

	const mutation = useSaveColumns({
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

	const [allCellEdits, setCellEdits] = useAtom(cellEditsAtom);
	const cellEdits = allCellEdits?.[tableName] || [];

	const [pageState, setPageState] = useAtom(pageStateAtom);
	const selectedRow = (pageState as any)?.[tableName];

	const previousSelectedRow = usePrevious(selectedRow);

	const [allTablePageInfo, setPageInfo] = useAtom(tablePageInfoAtom);
	const pageInfo = allTablePageInfo[tableName] || {};

	const [columnWidth, setColumnWidth] = useState<any>(tableColumnWidth || {});

	const selectRowAndUpdateState = (row: number) => {
		const newSelectedRow = { [tableName]: rows[row] || {} } as any;
		let newState = {};

		setPageState((old: any) => {
			newState = {
				...old,
				[tableName]: {
					...(old?.[tableName] || {}),
					columns: newSelectedRow[tableName],
				},
			};

			return newState;
		});

		setTableRowSelection((curr: any) => ({
			...curr,
			[tableName]: true,
		}));

		// FIXME: why ask param?
		pageStateContext.state = {
			...pageStateContext.state,
			...newSelectedRow,
		};
		return newState;
	};

	const clickColButton = (event: any, col: number, row: number) => {
		setSelection((old: any) => {
			return {
				...old,
				current: {
					cell: [col, row],
					range: { x: col, y: row, width: 1, height: 1 },
					rangeStack: [],
				},
				rows: CompactSelection.fromSingleSelection([row, row + 1]),
			};
		});

		selectRowAndUpdateState(row);

		if (event?.type === 'function') {
			setButtonTrigger(JSON.stringify([row, col]));
		}
		handleEvent({
			action: ACTIONS.CLICK,
			resource: tableName,
			section: 'columns',
		});
	};

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

	const calculateTableComponentsHeight = useCallback(() => {
		if (tableBarRef?.current) {
			setTableBarHeight(tableBarRef?.current?.getBoundingClientRect()?.height);
		}

		if (tableHeaderRef?.current) {
			setTableHeaderHeight(tableHeaderRef?.current?.getBoundingClientRect()?.height);
		}

		if (pageBarRef?.current) {
			setPageBarHeight(pageBarRef?.current?.getBoundingClientRect()?.height);
		}
	}, []);

	useEffect(() => {
		/**
		 * Let all components render before calculating heights
		 */
		setTimeout(() => {
			calculateTableComponentsHeight();
		}, 150);
	}, [calculateTableComponentsHeight]);

	useEffect(() => {
		if (currentTableContext && currentTableContext?.reload) {
			/**
			 * Remove query because if user refreshes in middle of loading,
			 * for eg: wrong query and reloads it; we discard the old jobId
			 * and generate a new one to get fresh data
			 */
			removeQuery();

			refetch({ cancelRefetch: true });
			setPageContext(
				{
					...currentTableContext,
					[tableName]: {
						...(currentTableContext?.[tableName] || {}),
						reload: false,
					},
				},
				{ replace: true },
			);
		}
	}, [currentTableContext, removeQuery, setPageContext, tableName, refetch]);

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

	useEffect(() => {
		/**
		 * If fetcher changed for the table, and if columns are different than selected Row.
		 */
		if (
			JSON.stringify(currentFetcher) !== JSON.stringify(previousFetcher) &&
			selectedRow &&
			columnDict
		) {
			const columnNotFound = Object.keys(columnDict).find(
				(c) => !Object.keys(selectedRow)?.includes(c),
			);

			if (columnNotFound) {
				setPageState((old: any) => ({
					...old,
					[tableName]: {
						...(old?.[tableName] || {}),
						columns: Object.keys(columnDict).reduce(
							(acc: { [col: string]: string | null }, curr: string) => ({
								...acc,
								[curr]: null,
							}),
							{},
						),
					},
				}));
			}
		}
	}, [selectedRow, columnDict, tableName, currentFetcher, previousFetcher, setPageState]);

	useEffect(() => {
		if (JSON.stringify(previousSelectedRow) !== JSON.stringify(selectedRow)) {
			/**
			 * If row is not present just reset the selected row with column names
			 */
			const selectedIndex = rows.findIndex(
				(r: any) => JSON.stringify(r) === JSON.stringify(selectedRow),
			);

			const isEmptyRow = Object.keys(selectedRow || {}).find(
				(key: any) => selectedRow[key] !== null,
			);

			if (selectedIndex === -1 && selectedRow && !isEmptyRow) {
				setPageState((old: any) => ({
					...old,
					[tableName]: {
						...(old?.[tableName] || {}),
						columns: Object.keys(selectedRow).reduce(
							(acc: { [col: string]: string | null }, curr: string) => ({
								...acc,
								[curr]: null,
							}),
							{},
						),
					},
				}));
			}
		}
	}, [selectedRow, previousSelectedRow, tableName, rows, setPageState]);

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
				pageSize: size || 20,
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
					baseFontStyle: '12px',
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
					baseFontStyle: '12px',
			  };

	const visibleColumns = header.filter(
		(column: any) => !columnDict?.[column?.name] || !columnDict[column?.name]?.hidden,
	);

	const gridColumns = visibleColumns.map((column: any) => {
		const col = columnDict[column?.name] || column;

		// ⚠️ only by passing undefined we can hide column icon
		let icon = col?.display_type ? GridColumnIcon.HeaderString : undefined;

		if (col?.column_type === 'button_column') {
			icon = GridColumnIcon.HeaderCode;
		}

		switch (col?.display_type) {
			case 'currency':
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

		const messageType =
			pageStateContext?.context?.[tableName]?.columns?.[column.name]?.message_type;

		let color = '';

		switch (messageType) {
			case 'error': {
				color = '#C53030'; // red.600
				break;
			}
			case 'warning': {
				color = '#C05621'; // orange.600
				break;
			}
			case 'info': {
				color = '#2B6CB0'; // blue.600
				break;
			}
			default: {
				break;
			}
		}

		const themeOverride = color !== '' ? { textHeader: color, bgIconHeader: color } : {};

		const gridColumn = {
			id: column.name,
			title: column.name,
			width: columnWidth[column.name] || String(column.name).length * 10 + 35 + 30,
			icon,
			themeOverride,
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

		if (column?.column_type === 'button_column') {
			const currentActive = buttonTrigger === JSON.stringify([row, col]);
			const columnColor = theme.colors?.[column?.color || 'gray'];

			if (currentActive) {
				return {
					kind: GridCellKind.Custom,
					allowOverlay: false,
					readOnly: true,
					data: {
						kind: 'spinner-cell',
					},
					...themeOverride,
				};
			}

			return {
				kind: GridCellKind.Custom,
				allowOverlay: false,
				readonly: true,
				data: {
					kind: 'button-cell',
					backgroundColor: ['transparent', columnColor?.[100]],
					color: columnColor?.[500],
					borderColor: columnColor?.[500],
					borderRadius: 2,
					title: column.label,
					onClick: () => clickColButton(column?.on_click, col, row),
				},
				...themeOverride,
			};
		}

		switch (column?.display_type) {
			case 'array': {
				if (Array.isArray(currentValue)) {
					if (
						column?.configurations?.display_as === 'area' ||
						column?.configurations?.display_as === 'bar'
					) {
						const containsString = currentValue.find((c: any) => typeof c !== 'number');

						if (containsString) {
							return {
								kind: GridCellKind.Text,
								data: '',
								allowOverlay: false,
								displayData: 'Incorrect data',
								readonly: true,
								...themeOverride,
							};
						}

						const max = Math.max(...currentValue);
						const min = Math.min(...currentValue);

						return {
							kind: GridCellKind.Custom,
							allowOverlay: false,
							data: {
								kind: 'sparkline-cell',
								values: currentValue,
								displayValues: currentValue.map((x: any) => x.toString()),
								color:
									currentValue?.[0] < currentValue?.[currentValue.length - 1]
										? theme.colors.green[500]
										: theme.colors.red[500],
								graphKind: column?.configurations?.display_as,
								hideAxis: false,
								yAxis: [min, max],
							},
							...themeOverride,
						};
					}

					return {
						kind: GridCellKind.Custom,
						allowOverlay: true,
						copyData: '4',
						readonly: true,
						data: {
							kind: 'tags-cell',
							possibleTags: currentValue.map((c: any) => ({
								tag: c,
								color: '#cdcdcd',
							})),
							tags: currentValue.map((c: any) => String(c)),
						},
						...themeOverride,
					};
				}

				return {
					kind: GridCellKind.Text,
					data: '',
					allowOverlay: false,
					displayData: 'Incorrect data',
					readonly: true,
					...themeOverride,
				};
			}

			case 'float':
			case 'integer': {
				const nonNullConfigurationKey = Object.keys(column?.configurations || {}).find(
					(key) => column?.configurations[key] !== null,
				);
				switch (nonNullConfigurationKey) {
					case 'currency': {
						return {
							kind: GridCellKind.Number,
							data: cellValue,
							allowOverlay: canEdit,
							displayData:
								unParsedValue === null
									? ''
									: `${column?.configurations?.currency?.symbol}${cellValue}`,
							readonly: !canEdit,
							...themeOverride,
						};
					}

					default: {
						return {
							kind: GridCellKind.Number,
							data: cellValue,
							allowOverlay: canEdit,
							displayData: unParsedValue === null ? '' : cellValue.toString(),
							readonly: !canEdit,
							...themeOverride,
						};
					}
				}
			}

			case 'text': {
				const nonNullConfigurationKey = Object.keys(column?.configurations || {}).find(
					(key) => column?.configurations[key] !== null,
				);
				switch (nonNullConfigurationKey) {
					case 'select': {
						if (column?.configurations?.multiple) {
							const allOptions = [
								...new Set([
									...(column?.configurations?.options || []),
									...cellValue
										.split(',')
										.filter((o: any) => {
											return !(column?.configurations?.options || []).find(
												(c: any) => c?.value === o?.value,
											);
										})
										.map((o: any) => ({
											label: o,
											value: o,
										})),
								]),
							];

							return {
								kind: GridCellKind.Custom,
								allowOverlay: canEdit,
								data: {
									kind: 'multi-select-cell',
									values: cellValue?.split(','),
									options: allOptions.map((option: any) => ({
										...option,
										label: option?.name || option?.label,
										color: 'gray',
									})),

									allowDuplicates: false,
									allowCreation: false,
								},
								readonly: !canEdit,
								...themeOverride,
							};
						}

						const isElementAlreadyPresent = (
							column?.configurations?.options || []
						)?.find((c: any) => c.value === cellValue);

						const allOptions = [
							...(column?.configurations?.options || []),
							...(isElementAlreadyPresent
								? []
								: [{ label: cellValue, value: cellValue }]),
						];

						return {
							kind: GridCellKind.Custom,
							allowOverlay: canEdit,
							data: {
								kind: 'dropdown-cell',
								allowedValues: allOptions.map((option: any) => ({
									...option,
									label: option?.name || option?.label,
									color: 'gray',
								})),
								value: cellValue,
							},
							readonly: !canEdit,
							...themeOverride,
						};
					}

					default: {
						const urlRegex =
							/^(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/g;

						if (urlRegex.test(cellValue)) {
							return {
								kind: GridCellKind.Uri,
								displayData: cellValue,
								data: cellValue,
								hoverEffect: true,
								allowOverlay: true,
								readonly: !canEdit,
								onClickUri: (e: any) => {
									e.preventDefault();
									window.open(cellValue, '_blank');
								},
								...themeOverride,
							};
						}

						return {
							kind: GridCellKind.Text,
							data: cellValue,
							allowOverlay: true,
							displayData: String(cellValue),
							readonly: !canEdit,
							...themeOverride,
						};
					}
				}
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
					kind: GridCellKind.Custom,
					allowOverlay: true,
					readonly: !canEdit,
					data: {
						kind: 'date-picker-cell',
						date: getDateInstance(cellValue),
						displayDate: formatDateTime(cellValue),
						format: 'datetime-local',
					},

					...themeOverride,
				};
			}

			case 'date': {
				return {
					kind: GridCellKind.Custom,
					allowOverlay: canEdit,
					readonly: !canEdit,

					data: {
						kind: 'date-picker-cell',
						date: getDateInstance(cellValue),
						displayDate: formatDate(cellValue),
						format: 'date',
					},
					...themeOverride,
				};
			}

			case 'time': {
				return {
					kind: GridCellKind.Custom,
					allowOverlay: canEdit,
					readonly: !canEdit,

					data: {
						kind: 'date-picker-cell',
						date: new Date(getEpochFromTimeString(cellValue)),
						displayDate: formatTime(cellValue),
						format: 'time',
					},
					...themeOverride,
				};
			}

			default: {
				const urlRegex =
					/^(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/g;

				if (urlRegex.test(cellValue)) {
					return {
						kind: GridCellKind.Uri,
						displayData: cellValue,
						data: cellValue,
						hoverEffect: true,
						allowOverlay: true,
						readonly: !canEdit,
						onClickUri: (e: any) => {
							e.preventDefault();
							window.open(cellValue, '_blank');
						},
						...themeOverride,
					};
				}

				return {
					kind: GridCellKind.Text,
					data: cellValue,
					allowOverlay: true,
					displayData: String(cellValue),
					readonly: !canEdit,
					...themeOverride,
				};
			}
		}
	};

	const onCellEdited = (cell: any, editedCell: any) => {
		const [col, row] = cell;
		const currentRow = rows[row];

		if (editedCell.readonly) {
			return;
		}

		const column = columnDict[visibleColumns[col]?.name];

		let newValue: any = null;

		if (editedCell.kind === GridCellKind.Custom) {
			switch (editedCell.data.kind) {
				case 'date-picker-cell': {
					if (
						editedCell?.data?.format === 'datetime-local' ||
						editedCell?.data?.format === 'date'
					) {
						newValue = editedCell?.data?.date?.getTime();
					} else if (editedCell?.data?.format === 'time') {
						newValue = getTimeStringFromEpoch(editedCell?.data?.date?.getTime());
					}
					break;
				}
				case 'dropdown-cell': {
					newValue = editedCell?.data?.value;
					break;
				}
				case 'multi-select-cell': {
					newValue = editedCell?.data?.values?.join(',');
					break;
				}
				default:
			}
		} else {
			newValue = editedCell.data;
		}

		if (column) {
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
									new_value: newValue === undefined ? null : newValue,
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
							new_value: newValue === undefined ? null : newValue,
							value: currentRow[column.name],
							column_name: column.name,
							data_type: columnDict[column.name].data_type,
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

		let newState = {};

		setPageState((old: any) => {
			newState = {
				...old,
				[tableName]: {
					...(old?.[tableName] || {}),
					columns: newSelectedRow[tableName],
				},
			};

			return { ...old, ...newSelectedRow };
		});

		setTableRowSelection((curr: any) => ({
			...curr,
			[tableName]: false,
		}));
		// FIXME: why ask param?
		pageStateContext.state = { ...pageStateContext.state, ...newSelectedRow };
		sendJsonMessage({
			type: 'display_rule',
			state_context: {
				...pageStateContext,
				state: newState,
			},
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

			const newState = selectRowAndUpdateState(currentRow);

			if (availableMethods?.[tableName]?.methods.includes(ACTIONS.ROW_CHANGE)) {
				handleEvent({
					action: ACTIONS.ROW_CHANGE,
					resource: tableName,
					component: tableName,
					newState,
					section: 'table',
				});
			}

			sendJsonMessage({
				type: 'display_rule',
				state_context: {
					...pageStateContext,
					state: newState,
				},
				app_name: appName,
				page_name: pageName,
			});
		} else {
			onSelectionCleared();
		}
	};

	const handleCommitColumns = () => {
		mutation.mutate({
			appName,
			pageName,
			tableName,
			columns: header.map((c: any) => ({
				...(columnDict?.[c] || {}),
				...c,
			})),
		});
	};

	const highlights: any = cellEdits.map((edit: any) => {
		return {
			color: '#e5e5e5',
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

	const handleRemoveAlert = () => {
		setPageContext(
			{
				...(pageStateContext?.context || {}),
				[tableName]: {
					...(pageStateContext?.context?.[tableName] || {}),
					message: null,
					message_type: null,
				},
			},
			{
				replace: true,
			},
		);
	};

	const onComponentsUpdate = () => {
		setTimeout(() => {
			calculateTableComponentsHeight();
		}, 1000);
	};

	/**
	 * containerHeight is height of the canvas available for tables
	 * tableHeaderHeight is for height occupied by table meta
	 * pageBarHeight is for pagination
	 * tableBarHeight includes table bar including filters, messages or widget
	 *
	 * 6 is for other spaces
	 */
	const tableHeight = height - tableHeaderHeight - pageBarHeight - tableBarHeight - 6;

	return (
		<CurrentTableContext.Provider value={memoizedContext}>
			<Stack pos="relative" h="full" spacing="0">
				<NavLoader isLoading={isLoadingTable}>
					<Stack
						alignItems="center"
						ref={tableHeaderRef}
						flexShrink="0"
						pb="3"
						direction="row"
						w="full"
						overflow="hidden"
					>
						<Stack spacing="0" flexShrink="0">
							<LabelContainer>
								{isPreview ? null : (
									<Box
										_hover={{
											color: 'gray.800',
											borderColor: 'gray.50',
										}}
										borderWidth="1px"
										borderColor="transparent"
										borderRadius="sm"
										cursor="grab"
										className="react-grid-drag-handle"
									>
										<Move size="14" />
									</Box>
								)}
								<LabelContainer.Label>
									{extractTemplateString(table?.label || tableName, pageState)}
								</LabelContainer.Label>
								{isPreview ? null : (
									<LabelContainer.Code>{tableName}</LabelContainer.Code>
								)}

								{table?.smart && !isPreview ? (
									<Box
										fontSize="xs"
										px="2"
										my="1"
										py="1"
										borderRadius="sm"
										borderWidth="1px"
										borderColor="yellow.400"
										bg="yellow.50"
										color="yellow.700"
										fontWeight="medium"
										h="fit-content"
										w="fit-content"
									>
										Smart Table
									</Box>
								) : null}
							</LabelContainer>

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

						<Stack
							ml="auto"
							alignItems="center"
							direction="row"
							spacing="2"
							flexShrink="0"
						>
							<DeleteRowButton row={selection?.rows?.toArray()?.[0]} />
							<SaveEditsButton />
							<Tooltip label="Refresh data">
								<IconButton
									aria-label="Refresh Data"
									size="xs"
									colorScheme="gray"
									icon={<RotateCw size="14" />}
									variant="outline"
									isLoading={isRefetching}
									onClick={() => {
										/**
										 * Remove query because if user refreshes in middle of loading,
										 * for eg: wrong query and reloads it; we discard the old jobId
										 * and generate a new one to get fresh data
										 */
										if (isLoading) {
											removeQuery();
										}

										refetch({ cancelRefetch: true });
									}}
								/>
							</Tooltip>

							{!isLoading && !isPreview && tableIsUnsynced ? (
								<Tooltip label="Save columns">
									<Button
										variant="outline"
										colorScheme="gray"
										leftIcon={<UploadCloud size="14" />}
										size="sm"
										flexShrink="0"
										onClick={handleCommitColumns}
										isLoading={mutation.isLoading}
									>
										Save Columns
									</Button>
								</Tooltip>
							) : null}
						</Stack>
					</Stack>
				</NavLoader>

				<Stack position="relative" spacing="0">
					<Popover
						returnFocusOnClose={false}
						isOpen={!isPreview && !table?.smart && table?.fetcher && convertPopoverOpen}
						onClose={closeConvertPopover}
						placement="top-end"
						closeOnBlur={false}
					>
						<PopoverTrigger>
							<Box />
						</PopoverTrigger>
						{renderPopoverContent()}
					</Popover>

					<Box ref={tableBarRef}>
						<ComponentsPreview
							type="header"
							tableName={tableName}
							onUpdate={onComponentsUpdate}
						/>
					</Box>

					<Stack
						height={`${tableHeight}px`}
						borderWidth="1px"
						onDoubleClick={() => {
							if (!table?.smart && table?.type === 'sql') {
								openConvertPopover();
							}
						}}
					>
						{isLoading || isRefetching ? (
							<>
								{isRefetching ? (
									<Skeleton
										isLoaded={false}
										h="calc(100%-6px)"
										position="absolute"
										left="0"
										w="full"
										as={Stack}
										startColor="blackAlpha.200"
										endColor="blackAlpha.400"
										zIndex={9}
									/>
								) : null}
								<Progress
									w="full"
									position="absolute"
									top="-2px"
									left="0"
									size="xs"
									isIndeterminate
									colorScheme="blue"
								/>
							</>
						) : null}

						{!isPreview && errorMessage ? (
							<Center as={Stack} spacing="0" p="6" h="full">
								<Text color="red.500" fontWeight="medium" fontSize="lg">
									Failed to load data
								</Text>
								<Text fontSize="md">{getErrorMessage(errorMessage)}</Text>
							</Center>
						) : (
							<>
								<DataEditor
									columns={gridColumns}
									rows={Math.min(
										rows.length,
										pageInfo.pageSize || DEFAULT_PAGE_SIZE,
									)}
									customRenderers={ALL_CELLS}
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
									getCellsForSelection
									onCellEdited={onCellEdited}
									onPaste
									keybindings={{ search: true }}
									onColumnResize={onColumnResize}
									rowHeight={30}
									fixedShadowX={false}
									fixedShadowY={false}
								/>
							</>
						)}
					</Stack>

					<Box ref={pageBarRef}>
						<ComponentsPreview
							type="footer"
							tableName={tableName}
							onUpdate={onComponentsUpdate}
						/>
					</Box>
				</Stack>

				<Notification
					message={pageStateContext?.context?.[tableName]?.message}
					type={pageStateContext?.context?.[tableName]?.message_type}
					onClose={handleRemoveAlert}
				/>
			</Stack>
		</CurrentTableContext.Provider>
	);
};
