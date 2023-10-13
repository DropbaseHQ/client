import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const removeUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await axios.post(`/group/remove_user/${groupId}`, { user_id: userId });
	return response.data;
};

export const useRemoveUserFromGroup = (mutationConfig?: any) => {
	return useMutation(removeUserToGroup, {
		...(mutationConfig || {}),
	});
};
