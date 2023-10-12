import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const addUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await axios.post(`/group/add_user/${groupId}`, { user_id: userId });
	return response.data;
};

export const useAddUserToGroup = (mutationConfig?: any) => {
	return useMutation(addUserToGroup, {
		...(mutationConfig || {}),
	});
};
