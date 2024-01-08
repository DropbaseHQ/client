import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { filtersAtom, sortsAtom, tablePageInfoAtom } from '@/features/smart-table/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { useGetColumnProperties } from '@/features/app-builder/hooks';
import { DEFAULT_PAGE_SIZE } from '../constants';

export const CurrentTableContext: any = createContext({ tableName: null });

export const useCurrentTableName = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableName;
};

export const useCurrentTableData = (tableName: any) => {
	const { pageName, appName } = useParams();

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

	const state = useAtomValue(newPageStateAtom);

	const tableData = useTableData({
		tableName,
		filters,
		sorts,
		state,
		pageName,
		appName,
		...pageInfo,
	});

	const dropbaseStoredData = useGetColumnProperties(tableName);

	return {
		...tableData,
		isLoading: dropbaseStoredData.isLoading || tableData.isLoading,
		columns: dropbaseStoredData.columns,
	};
};

export const useTableSyncStatus = (tableName: any) => {
	const { header, columns, isLoading, isRefetching } = useCurrentTableData(tableName);

	const [needsSync, setNeedSync] = useState(false);

	useEffect(() => {
		if (!isLoading || !isRefetching) {
			const isSynced =
				header.every((c: any) => (columns as any)[c]) &&
				header.length === Object.keys(columns).length;

			setNeedSync(!isSynced);
		}
	}, [header, isLoading, isRefetching, columns, tableName]);

	return header.length > 0 ? needsSync : false;
};
