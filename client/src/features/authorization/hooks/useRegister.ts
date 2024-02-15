import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';

const registerUser = async ({
	email,
	password,
	name,
	last_name,
	company,
}: {
	email: string;
	password: string;
	name: string;
	last_name: string;
	company: string;
}) => {
	const response = await axios.post<{ user: string }>(`/user/register`, {
		email,
		password,
		name,
		last_name,
		company,
	});

	return response.data;
};

export const useRegister = (mutationConfig: MutationConfig<typeof registerUser>) => {
	return useMutation(registerUser, {
		...(mutationConfig || {}),
	});
};
