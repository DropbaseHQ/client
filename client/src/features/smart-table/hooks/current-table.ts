import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { set } from 'lodash';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTableData } from './table';
import { filtersAtom, sortsAtom, tablePageInfoAtom } from '@/features/smart-table/atoms';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { useGetPage } from '@/features/page';
import { tableColumnTypesAtom } from '@/features/app-state';

export const CurrentTableContext: any = createContext({ tableName: null });

export const useCurrentTableName = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableName;
};

export const useCurrentTableData = (tableName: any) => {
	const { pageName, appName } = useParams();
	const setTableColumnTypes = useSetAtom(tableColumnTypesAtom);

	const allFilters = useAtomValue(filtersAtom);
	const filters = (allFilters[tableName] || []).filter((f: any) => {
		if (f.condition === 'is null' || f.condition === 'is not null') {
			return f.column_name;
		}
		return f.column_name && f.value;
	});

	const allSorts = useAtomValue(sortsAtom);
	const sorts = (allSorts[tableName] || []).filter((f: any) => f.column_name);

	const pageInfo = useAtomValue(tablePageInfoAtom)?.[tableName] || {
		currentPage: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	};

	const tableData = useTableData({
		tableName,
		filters,
		sorts,
		pageName,
		appName,
		...pageInfo,
	});

	const { tables, isLoading: isLoadingPage } = useGetPage({ appName, pageName });
	const table = tables?.find((t: any) => t.name === tableName);
	const columnDict = table?.columns?.reduce((agg: any, c: any) => {
		return {
			...agg,
			[c.name]: c,
		};
	}, {});
	setTableColumnTypes((old: any) => {
		const newColumnTypes: any = {};
		Object.entries(columnDict || {}).forEach(([key, value]: any) => {
			if (value?.display_type) {
				set(newColumnTypes, key, value?.display_type);
			}
		});
		return {
			...old,
			[tableName]: newColumnTypes,
		};
	});

	return {
		...tableData,
		isLoading: isLoadingPage || tableData.isLoading,
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
