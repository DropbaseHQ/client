import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

const confirmEmail = async ({ userId, token }: { userId: string; token: string }) => {
	const response = await axios.post<{ user: string }>(
		`user/verify?token=${token}&user_id=${userId}`,
	);

	return response.data;
};

export const useConfirmEmail = ({ userId, token }: { userId: string; token: string }) => {
	return useQuery(['confirmEmail', userId, token], () => confirmEmail({ userId, token }));
};
