import { useMemo, useEffect, useRef } from 'react';
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

	const ref = useRef(false);

	const { widget, isLoading, ...rest } = useGetPage(pageId || '');

	useEffect(() => {
		ref.current = false;
	}, [pageId]);

	useEffect(() => {
		if (!context.widgetId && !isLoading && !ref.current) {
			setPageContext({
				widgetId: widget?.id || null,
			});
			ref.current = true;
		}
	}, [widget, isLoading, context, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({
				widgetId: null,
			});
		};
	}, [setPageContext]);

	return { widget, isLoading, ...rest };
};
