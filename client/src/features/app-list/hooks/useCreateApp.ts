import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const createApp = async ({ name, workspaceId }: { name: string; workspaceId: string }) => {
	const response = await axios.post('/app/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateApp = (mutationConfig?: any) => {
	return useMutation(createApp, {
		...(mutationConfig || {}),
	});
};
