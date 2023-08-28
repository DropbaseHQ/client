import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';

export const SCHEMA_QUERY_KEY = 'all-schema';

const fetchSchema = async (pageId: string) => {
	const response = await axios.get(`/page/${pageId}/schema`);
	return response.data;
};

export const useSchema = (pageId: string) => {
	const queryKey = [SCHEMA_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchSchema(pageId || ''));

	return {
		...rest,
		schema: response,
		queryKey,
	};
};
