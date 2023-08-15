import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';

export const SCHEMA_QUERY_KEY = 'all-schema';

const fetchSchema = async () => {

	const appId = '123';
	const response = await axios.get(`/app/${appId}/schema`)
	return response.data;
};

export const useSchema = () => {
	const queryKey = [SCHEMA_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchSchema());

	return {
		...rest,
		schema: response,
		queryKey,
	};
};
