import { useMutation } from 'react-query';
import { MutationConfig } from '@/lib/react-query';
import { axios } from '@/lib/axios';

export type OnboardResponse = {
	successful: boolean;
};
const onboard = async ({ company }: { company: string }) => {
	const response = await axios.post<OnboardResponse>(`/user/onboard`, {
		company,
	});

	return response.data;
};

export const useOnboard = (mutationConfig: MutationConfig<typeof onboard>) => {
	return useMutation(onboard, {
		...(mutationConfig || {}),
	});
};
