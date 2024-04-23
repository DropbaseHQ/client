import { useMutation } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const resendConfirmEmail = async ({ email }: { email: string }) => {
	const response = await workerAxios.post<{ user: string }>(`/user/resend_confirmation_email`, {
		email,
	});

	return response.data;
};

export const useResendConfirmEmail = (
	mutationConfig?: MutationConfig<typeof resendConfirmEmail>,
) => {
	return useMutation(resendConfirmEmail, {
		...(mutationConfig || {}),
	});
};
