import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';

export const PAGE_DATA_QUERY_KEY = 'pageData';

const fetchPage = async ({ pageId }: any) => {
	const response = await axios.get<any>(`/page/${pageId}`);

	return response.data;
};

export const useGetPage = (pageId: any) => {
	const queryKey = [PAGE_DATA_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPage({ pageId }));

	const data: any = useMemo(() => {
		return response || {};
	}, [response]);

	return {
		...rest,

		queryKey,
		...data,
	};
};
