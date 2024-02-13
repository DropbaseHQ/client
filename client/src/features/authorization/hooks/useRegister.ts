import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const registerUser = async ({
	email,
	password,
	name,
}: {
	email: string;
	password: string;
	name: string;
}) => {
	const response = await axios.post<{ user: string }>(`/user/register`, {
		email,
		password,
		name,
	});

	return response.data;
};

export const useRegister = (mutationConfig: MutationConfig<typeof registerUser>) => {
	return useMutation(registerUser, {
		...(mutationConfig || {}),
	});
};
