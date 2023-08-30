import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from 'react-query';

const loginUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await axios.post<{ access_token: string; token: string }>(`/user/login`, {
		email,
		password,
	});

	return response.data;
};

export const useLogin = (mutationConfig: MutationConfig<typeof loginUser>) => {
	return useMutation(loginUser, {
		...(mutationConfig || {}),
	});
};
