import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type Pages = {
	name: string;
	app_id: string;
	date: string;
	id: string;
};

const fetchAppPages = async () => {
	const { data } = await axios.get<Pages[]>(`/page/list`);
	return data;
};

export const useGetAppPages = () => {
	const queryKey = ['appPages'];
	const { data: response, ...rest } = useQuery(queryKey, fetchAppPages);
	return {
		pages: response || [],
		...rest,
	};
};
