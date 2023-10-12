import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const inviteMember = async ({
	email,
	workspaceId,
	roleId,
}: {
	email: string;
	workspaceId: any;
	roleId: string;
}) => {
	const response = await axios.post(`/workspace/${workspaceId}/add_user`, {
		user_email: email,
		role_id: roleId,
	});
	return response.data;
};

export const useInviteMember = (mutationConfig?: any) => {
	return useMutation(inviteMember, {
		...(mutationConfig || {}),
	});
};
