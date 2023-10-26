import { createContext, useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useSyncDropbaseColumns, useTableData } from './table';
import { filtersAtom, sortsAtom } from '@/features/smart-table/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { useGetColumnProperties } from '@/features/app-builder/hooks';
import { proxyTokenAtom } from '@/features/settings/atoms';

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

export const useSyncCurrentTable = (tableId: any) => {
	const token = useAtomValue(proxyTokenAtom);
	const { pageName, appName } = useAtomValue(pageAtom);

	const syncRef = useRef(false);
	const { header, columns, isLoading } = useCurrentTableData(tableId);

	const mutation = useSyncDropbaseColumns();

	useEffect(() => {
		if (!isLoading && !syncRef.current) {
			const isSynced = header.every((c: any) => (columns as any)[c]);

			if (!isSynced) {
				syncRef.current = true;
				mutation.mutate({
					tableId,
					columns: header,
					appName,
					pageName,
					token,
				});
			}
		}
	}, [header, isLoading, columns, mutation, tableId]);
};

export const useTableSyncStatus = (tableId: any) => {
	const syncRef = useRef(false);
	const { header, columns, isLoading } = useCurrentTableData(tableId);

	let hasChanged = false;

	useEffect(() => {
		if (!isLoading && !syncRef.current) {
			const isSynced = header.every((c: any) => (columns as any)[c]);

			if (!isSynced) {
				hasChanged = true;
				syncRef.current = true;
			}
		}
	}, [header, isLoading, columns, tableId]);
	return hasChanged;
};