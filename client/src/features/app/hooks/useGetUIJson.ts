import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { axios } from '@/lib/axios';

const fetchUIJson = async ({ code, app_id }: { code: string; app_id: string }) => {
	const { data } = await axios.post('components/some_id/convert', {
		code,
		app_id,
	});
	return data;
};

const UI_JSON_QUERY_KEY = 'ui-json';

export const useGetUIJson = ({
	code = '',
	app_id = '',
}: { code?: string; app_id?: string } = {}) => {
	const queryKey = [UI_JSON_QUERY_KEY, app_id || '', code];
	const { data, ...rest } = useQuery(queryKey, () => fetchUIJson({ code, app_id }));

	const components = useMemo(() => {
		return (data?.components || []).map((c: any) => {
			const parsedComponent = JSON.parse(c);
			return parsedComponent;
		});
	}, [data]);

	return { components, queryKey, ...rest };
};
