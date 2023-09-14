import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { pageAtom } from '@/features/new-page';
import { tableFilters, tableSorts } from '@/features/new-smart-table/atoms';

export const useCurrentTableData = () => {
	const { tableId } = useAtomValue(pageAtom);
	const filters = useAtomValue(tableFilters);
	const sorts = useAtomValue(tableSorts);

	return useTableData({
		tableId,
		filters,
		sorts,
	});
};
