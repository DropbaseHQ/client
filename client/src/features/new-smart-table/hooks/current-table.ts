import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { pageAtom } from '@/features/new-page';
import { tableFilters, tableSorts } from '@/features/new-smart-table/atoms';
import { newPageStateAtom } from '@/features/new-app-state';

export const useCurrentTableData = () => {
	const { tableId } = useAtomValue(pageAtom);
	const filters = useAtomValue(tableFilters);
	const sorts = useAtomValue(tableSorts);
	const state = useAtomValue(newPageStateAtom);

	return useTableData({
		tableId,
		filters,
		sorts,
		state : state.tables,
	});
};
