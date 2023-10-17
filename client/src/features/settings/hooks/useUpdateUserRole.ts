import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateUserRole = async ({
	userId,
	roleId,
	workspaceId,
}: {
	userId: string;
	roleId: string;
	workspaceId: any;
}) => {
	const response = await axios.put(`/workspace/${workspaceId}/user_role`, {
		user_id: userId,
		role_id: roleId,
	});
	return response.data;
};

export const useUpdateUserRole = (mutationConfig?: any) => {
	return useMutation(updateUserRole, {
		...(mutationConfig || {}),
	});
};
