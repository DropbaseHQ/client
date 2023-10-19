import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { filtersAtom, sortsAtom } from '@/features/new-smart-table/atoms';
import { newPageStateAtom } from '@/features/new-app-state';
import { pageAtom } from '@/features/new-page';

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

	return useTableData({
		tableId,
		filters,
		sorts,
		state,
		pageId,
		pageName,
		appName,
	});
};
