import { useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';

import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';

import { axios } from '@/lib/axios';
import { pageAtom } from '../atoms';

export const PAGE_DATA_QUERY_KEY = 'pageData';

const fetchPage = async ({ pageId }: any) => {
	const response = await axios.get<any>(`/page/${pageId}`);

	return response.data;
};

export const useGetPage = (pageId: any) => {
	const queryKey = [PAGE_DATA_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPage({ pageId }));

	const data: any = useMemo(() => {
		return {
			tables: response?.tables || [],
			widget: response?.widget || null,
			functions: response?.functions || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...data,
	};
};

export const useInitPage = () => {
	const { pageId } = useParams();
	const [context, setPageContext] = useAtom(pageAtom);

	const { tables, widget, ...rest } = useGetPage(pageId || '');

	useEffect(() => {
		if (!(context.tableId || context.widgetId)) {
			setPageContext({
				tableId: tables?.[0]?.id,
				widgetId: widget?.id,
			});
		}
	}, [tables, widget, context, setPageContext]);

	return { tables, widget, ...rest };
};
