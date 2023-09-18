import { useMutation, useQueryClient } from 'react-query';
import { axios } from '@/lib/axios';

const createSource = async ({ name, type, workspaceId, description, creds }: any) => {
	const response = await axios.post(`/source/`, {
		name,
		workspace_id: workspaceId,
		description,
		type,
		creds,
	});

	return response.data;
};

export const useCreateSource = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createSource, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries('some_rabndom_qyuert');
		},
	});
};
