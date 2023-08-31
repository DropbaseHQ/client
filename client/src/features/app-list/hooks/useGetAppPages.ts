import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type Pages = {
	name: string;
	app_id: string;
	date: string;
	id: string;
};

const fetchAppPages = async ({ appId }: { appId: string }) => {
	const { data } = await axios.get<Pages[]>(`/app/${appId}/pages`);
	return data;
};

export const useGetAppPages = ({ appId }: { appId: string }) => {
	const queryKey = ['appPages', appId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchAppPages({ appId }));
	return {
		pages: response || [],
		...rest,
	};
};
