import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { workerAxios } from '@/lib/axios';

const fetchCurrentUser = async () => {
	const { data } = await workerAxios.get(`/user`);
	return data;
};

export const useGetCurrentUser = () => {
	const { pathname } = useLocation();
	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot') ||
		pathname.startsWith('/github_auth');

	const queryKey = ['currentUser'];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchCurrentUser(), {
		enabled: !loginRoutes,
	});
	return {
		user: response || {},
		...rest,
	};
};
