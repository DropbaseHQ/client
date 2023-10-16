import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const removeMember = async ({ userId, workspaceId }: { userId: string; workspaceId: any }) => {
	const response = await axios.post(`/workspace/${workspaceId}/remove_user`, {
		user_id: userId,
	});
	return response.data;
};

export const useRemoveMember = (mutationConfig?: any) => {
	return useMutation(removeMember, {
		...(mutationConfig || {}),
	});
};
