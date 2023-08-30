import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { axios } from '@/lib/axios';
import { runResultAtom } from '@/features/app-builder/atoms/tableContextAtoms';
import { useGetPage } from '@/features/app/hooks';

const fetchUIJson = async ({ code, action_id }: { code: string; action_id: string }) => {
	const { data } = await axios.post('components/convert', {
		code,
		action_id,
	});
	return data;
};

const UI_JSON_QUERY_KEY = 'ui-json';

export const useGetUIJson = ({
	code = '',
	page_id = '',
}: { code?: string; page_id?: string } = {}) => {
	const setRunResult = useSetAtom(runResultAtom);

	const { action } = useGetPage(page_id);

	const queryKey = [UI_JSON_QUERY_KEY, action?.id || '', code];
	const { data, ...rest } = useQuery(
		queryKey,
		() => fetchUIJson({ code, action_id: action?.id }),
		{
			onError: (error: any) => {
				setRunResult(error?.response?.data?.error);
			},
			onSuccess: () => {
				setRunResult('');
			},
			enabled: Boolean(code && action?.id),
		},
	);

	const components = useMemo(() => {
		return (data?.components || []).map((c: any) => {
			const parsedComponent = JSON.parse(c);
			return parsedComponent;
		});
	}, [data]);

	return { components, queryKey, ...rest };
};
