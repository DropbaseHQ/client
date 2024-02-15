import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const resendConfirmEmail = async ({ email }: { email: string }) => {
	const response = await axios.post<{ user: string }>(`/user/resend_confirmation_email`, {
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
