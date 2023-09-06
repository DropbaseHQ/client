import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const createApp = async ({ name }: { name: string }) => {
	const response = await axios.post('/app/', { name });
	return response.data;
};

export const useCreateApp = (mutationConfig?: any) => {
	return useMutation(createApp, {
		...(mutationConfig || {}),
	});
};
