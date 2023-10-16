import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateUserPolicy = async ({
	userId,
	resource,
	action,
	workspaceId,
}: {
	userId: string;
	resource: string;
	action: string;
	workspaceId: string;
}) => {
	const response = await axios.post(`/user/update_policy/${userId}`, {
		resource,
		action,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useUpdateUserPolicy = (mutationConfig?: any) => {
	return useMutation(updateUserPolicy, {
		...(mutationConfig || {}),
	});
};
