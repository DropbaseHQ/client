import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { filtersAtom, sortsAtom } from '@/features/smart-table/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { useGetColumnProperties } from '@/features/app-builder/hooks';

export const CurrentTableContext: any = createContext({ tableId: null });

export const useCurrentTableId = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableId;
};

export const useCurrentTableData = (tableId: any) => {
	const { pageName, appName } = useAtomValue(pageAtom);

	const allFilters = useAtomValue(filtersAtom);
	const filters = (allFilters[tableId] || []).filter((f: any) => f.column_name && f.value);

	const allSorts = useAtomValue(sortsAtom);
	const sorts = (allSorts[tableId] || []).filter((f: any) => f.column_name);

	const state = useAtomValue(newPageStateAtom);
	const { pageId } = useParams();

	const tableData = useTableData({
		tableId,
		filters,
		sorts,
		state,
		pageId,
		pageName,
		appName,
	});

	const dropbaseStoredData = useGetColumnProperties(tableId);

	return {
		...tableData,
		isLoading: dropbaseStoredData.isLoading || tableData.isLoading,
		columns: dropbaseStoredData.columns,
	};
};

export const useTableSyncStatus = (tableId: any) => {
	const { header, columns, isLoading, isRefetching } = useCurrentTableData(tableId);
	
	const [needsSync, setNeedSync] = useState(false);

	useEffect(() => {
		if (!isLoading || !isRefetching) {
			const isSynced = header.every((c: any) => (columns as any)[c]) &&
			header.length === Object.keys(columns).length; 

			setNeedSync(!isSynced); 
		}
	}, [header, isLoading,isRefetching, columns, tableId]);

	return needsSync;
};
