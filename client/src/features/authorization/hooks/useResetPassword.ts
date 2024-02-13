import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const requestResetPasswordMail = async ({ email }: { email: string }) => {
	const response = await axios.post<{ user: string }>(`/user/request_reset_password`, {
		email,
	});

	return response.data;
};

export const useRequestResetPasswordMail = (
	mutationConfig: MutationConfig<typeof requestResetPasswordMail>,
) => {
	return useMutation(requestResetPasswordMail, {
		...(mutationConfig || {}),
	});
};

const resetPassword = async ({
	email,
	password,
	resetToken,
}: {
	email: string;
	password: string;
	resetToken: string;
}) => {
	const response = await axios.post<{ user: string }>(`/user/reset_password`, {
		email,
		new_password: password,
		reset_token: resetToken,
	});

	return response.data;
};

export const useResetPassword = (mutationConfig: MutationConfig<typeof resetPassword>) => {
	return useMutation(resetPassword, {
		...(mutationConfig || {}),
	});
};
