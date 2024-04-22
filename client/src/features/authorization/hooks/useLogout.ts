import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { workerAxios, setWorkerAxiosToken } from '@/lib/axios';

import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

const logoutUser = async () => {
	const response = await workerAxios.delete<any>(`/user/logout`);

	return response.data;
};

export const useLogout = () => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation(() => logoutUser(), {
		onSuccess: () => {
			queryClient.clear();
			setWorkerAxiosToken(null);
			setWorkerAxiosToken(null);
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			document.cookie = 'worker_sl_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			navigate('/login');
		},
		onError: (err: any) => {
			toast({
				status: 'error',
				title: 'Failed to logout',
				description: getErrorMessage(err),
			});
		},
	});
};
