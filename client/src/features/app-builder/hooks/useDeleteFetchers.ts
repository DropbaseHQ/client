import { useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { axios } from '@/lib/axios';
import { fetchersAtom } from '@/features/app-builder/atoms/tableContextAtoms';
import { useToast } from '@/lib/chakra-ui';
import { useGetPage } from '@/features/app/hooks';

const deleteFetcher = async (functionId: string) => {
	const { data } = await axios.delete(`/function/${functionId}`);
	return data;
};

export const useDeleteFunction = () => {
	const { pageId } = useParams();
	const toast = useToast();
	const [fetchers, setFetchers] = useAtom(fetchersAtom);

	const { fetchers: savedFetchers } = useGetPage(pageId || '');

	const deleteFromLocalState = useCallback(
		(fetcherId: string) => {
			const { [fetcherId]: deletedId, ...rest } = fetchers;
			setFetchers(rest);
		},
		[fetchers, setFetchers],
	);

	const deleteMutation = useMutation(deleteFetcher, {
		onSuccess: (_, fetcherId) => {
			const fetcherToDelete = fetchers.find((f: any) => f.id === fetcherId);

			if (fetcherToDelete) {
				deleteFromLocalState(fetcherId);
			}
		},
	});

	const handleDelete = useCallback(
		async (fetcherId: string) => {
			const savedFetcher = savedFetchers.find((f: any) => f.id === fetcherId);

			try {
				if (savedFetcher) {
					await deleteMutation.mutateAsync(fetcherId);
				} else {
					deleteFromLocalState(fetcherId);
				}

				toast({
					status: 'success',
					title: 'Deleted function',
				});
			} catch (e: any) {
				toast({
					status: 'error',
					title: 'Failed to delete function',
					description: e.message,
				});
			}
		},
		[savedFetchers, toast, deleteMutation, deleteFromLocalState],
	);

	return handleDelete;
};
