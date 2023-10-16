import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateGroupPolicy = async ({
	groupId,
	resource,
	action,
}: {
	groupId: string;
	resource: string;
	action: string;
}) => {
	const response = await axios.post(`/group/update_policy/${groupId}`, {
		resource,
		action,
	});
	return response.data;
};

export const useUpdateGroupPolicy = (mutationConfig?: any) => {
	return useMutation(updateGroupPolicy, {
		...(mutationConfig || {}),
	});
};
