import { axios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';
import { useMutation } from 'react-query';

const logoutUser = async () => {
	const response = await axios.delete<any>(`/logout`);

	return response.data;
};

export const useLogout = () => {
	const toast = useToast();

	return useMutation(() => logoutUser(), {
		onSuccess: () => {
			window.location.reload();
		},
		onError: (err: any) => {
			toast({
				status: 'error',
				title: 'Failed to logout',
				description: err.message,
			});
		},
	});
};
