import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { focusAtom } from 'jotai-optics';

import { useAtomValue } from 'jotai';
import { useParsedData, useTableData } from './table';
import { filtersAtom, sortsAtom, tablePageInfoAtom } from '@/features/smart-table/atoms';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useGetPage } from '@/features/page';
import { pageContextAtom } from '@/features/app-state';

export const CurrentTableContext: any = createContext({ tableName: null });

export const useCurrentTableName = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableName;
};

export const useCurrentTableData = (tableName: any) => {
	const { pageName, appName } = useParams();

	const tableContextAtom = useMemo(() => {
		return focusAtom(pageContextAtom, (optic: any) => optic.prop(tableName));
	}, [tableName]);
	const tableContext: any = useAtomValue(tableContextAtom);

	const allSorts = useAtomValue(sortsAtom);
	const sorts = (allSorts[tableName] || []).filter((f: any) => f.column_name);

	const pageInfo = useAtomValue(tablePageInfoAtom)?.[tableName] || {
		currentPage: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	};

	const { tables, isLoading: isLoadingPage } = useGetPage({ appName, pageName });
	const table = tables?.find((t: any) => t.name === tableName);
	const columnDict = table?.columns?.reduce((agg: any, c: any) => {
		return {
			...agg,
			[c.name]: c,
		};
	}, {});

	const allFilters = useAtomValue(filtersAtom);
	const filters = (allFilters[tableName] || [])
		.filter((f: any) => {
			if (f.condition === 'is null' || f.condition === 'is not null') {
				return f.column_name;
			}
			return f.column_name && f.value;
		})
		.map((f: any) => ({
			...f,
			column_type: columnDict[f?.column_name]?.display_type || '',
		}));

	const tableMetaInfo = useTableData({
		tableName,
		filters,
		sorts,
		pageName,
		appName,
		...pageInfo,
	});

	const tableData = useParsedData(tableContext?.data, table);

	return {
		...tableMetaInfo,
		...tableData,
		isLoading: isLoadingPage || tableMetaInfo.isLoading,
		columns: table?.columns,
		columnDict,
	};
};

export const useTableSyncStatus = (tableName: any) => {
	const { header, columns, isLoading, isRefetching, columnDict } = useCurrentTableData(tableName);

	const [needsSync, setNeedSync] = useState(false);

	useEffect(() => {
		if (!isLoading || !isRefetching) {
			const isSynced =
				header.every((c: any) => (columnDict as any)[c?.name]) &&
				header.length === columns?.length;

			setNeedSync(!isSynced);
		}
	}, [header, isLoading, isRefetching, columns, columnDict, tableName]);

	return header.length > 0 ? needsSync : false;
};
