import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';

const confirmEmail = async ({ userId, token }: { userId: string; token: string }) => {
	const response = await workerAxios.post<{ user: string }>(
		`user/verify?token=${token}&user_id=${userId}`,
	);

	return response.data;
};

export const useConfirmEmail = ({ userId, token }: { userId: string; token: string }) => {
	return useQuery(['confirmEmail', userId, token], () => confirmEmail({ userId, token }));
};
