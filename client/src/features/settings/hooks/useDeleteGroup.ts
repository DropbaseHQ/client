import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const deleteGroup = async ({ groupId }: { groupId: string }) => {
	const response = await axios.delete(`/group/${groupId}`);
	return response.data;
};

export const useDeleteGroup = (mutationConfig?: any) => {
	return useMutation(deleteGroup, {
		...(mutationConfig || {}),
	});
};
