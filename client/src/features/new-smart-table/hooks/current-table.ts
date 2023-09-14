import { useAtomValue } from 'jotai';
import { useTableData } from './table';
import { pageAtom } from '@/features/new-page';

export const useCurrentTableData = () => {
	const { tableId } = useAtomValue(pageAtom);

	return useTableData({
		tableId,
	});
};
