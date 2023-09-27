import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { tableFilters, tableSorts } from '@/features/new-smart-table/atoms';
import { newPageStateAtom } from '@/features/new-app-state';

export const CurrentTableContext: any = createContext({ tableId: null });

export const useCurrentTableId = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableId;
};

export const useCurrentTableData = (tableId: any) => {
	const filters = useAtomValue(tableFilters);
	const sorts = useAtomValue(tableSorts);
	const state = useAtomValue(newPageStateAtom);
	const { pageId } = useParams();

	return useTableData({
		tableId,
		filters,
		sorts,
		state,
		pageId,
	});
};
