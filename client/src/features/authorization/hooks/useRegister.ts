import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const registerUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await axios.post<{ user: string }>(`/user/register`, {
		email,
		password,
	});

	return response.data;
};

const registerGoogleUser = async ({ credential }: { credential: string }) => {
	const response = await axios.post<{ user: string }>(`/user/registerGoogle`, {
		credential,
	});

	return response.data;
};

export const useRegister = (mutationConfig: MutationConfig<typeof registerUser>) => {
	return useMutation(registerUser, {
		...(mutationConfig || {}),
	});
};

export const useGoogleRegister = (mutationConfig: MutationConfig<typeof registerGoogleUser>) => {
	return useMutation(registerGoogleUser, {
		...(mutationConfig || {}),
	});
};
