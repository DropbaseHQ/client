import { useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';

import { PAGE_DATA_QUERY_KEY, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';

export const WIDGET_QUERY_KEY = 'widget';

export const useCreateWidget = (props: any = {}) => {
	const queryClient = useQueryClient();
	const toast = useToast();

	const updateSelectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdatePageData({
		...props,
		onSuccess: (data: any) => {
			updateSelectedResource({
				type: 'widget',
				id: data?.widget?.id,
				meta: null,
			});

			toast({
				status: 'success',
				title: 'Widget created',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create widget',
				description: getErrorMessage(error),
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});

	return mutation;
};
