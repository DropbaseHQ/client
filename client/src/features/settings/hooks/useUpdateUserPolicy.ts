import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateUserPolicy = async ({
	userId,
	resource,
	action,
	effect,
	workspaceId,
}: {
	userId: string;
	resource: string;
	action: string;
	effect: string;
	workspaceId: string;
}) => {
	const response = await axios.post(`/user/update_policy/${userId}`, {
		resource,
		action,
		effect,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useUpdateUserPolicy = (mutationConfig?: any) => {
	return useMutation(updateUserPolicy, {
		...(mutationConfig || {}),
	});
};
