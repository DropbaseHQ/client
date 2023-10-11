import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateGroupPolicy = async ({
	groupId,
	resource,
	action,
	effect,
}: {
	groupId: string;
	resource: string;
	action: string;
	effect: string;
}) => {
	const response = await axios.post(`/group/update_policy/${groupId}`, {
		resource,
		action,
		effect,
	});
	return response.data;
};

export const useUpdateGroupPolicy = (mutationConfig?: any) => {
	return useMutation(updateGroupPolicy, {
		...(mutationConfig || {}),
	});
};
