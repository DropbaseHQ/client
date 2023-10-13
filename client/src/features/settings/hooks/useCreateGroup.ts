import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const createGroup = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post('/group/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateGroup = (mutationConfig?: any) => {
	return useMutation(createGroup, {
		...(mutationConfig || {}),
	});
};
