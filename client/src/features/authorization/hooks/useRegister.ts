import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from 'react-query';

const registerUser = async ({
	email,
	password,
	first_name,
	company,
}: {
	email: string;
	password: string;
	first_name: string;
	company: string;
}) => {
	const response = await axios.post<{ user: string }>(`/user/register`, {
		email,
		password,
		first_name,
		company,
	});

	return response.data;
};

export const useRegister = (mutationConfig: MutationConfig<typeof registerUser>) => {
	return useMutation(registerUser, {
		...(mutationConfig || {}),
	});
};
