import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { axios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

const logoutUser = async () => {
	const response = await axios.delete<any>(`/user/logout`);

	return response.data;
};

export const useLogout = () => {
	const toast = useToast();
	const navigate = useNavigate();
	return useMutation(() => logoutUser(), {
		onSuccess: () => {
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
