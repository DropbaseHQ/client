import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';

const fetchCurrentUser = async () => {
	const { data } = await axios.get(`/user`);
	return data;
};

export const useGetCurrentUser = () => {
	const queryKey = ['currentUser'];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchCurrentUser());
	return {
		user: response || {},
		...rest,
	};
};
