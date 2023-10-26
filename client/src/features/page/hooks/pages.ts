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
			page: response?.page || {},
			app: response?.app || {},
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

	const { widget, isLoading, app, page, ...rest } = useGetPage(pageId || '');
	const pageName = page?.name;
	const appName = app?.name;

	useEffect(() => {
		ref.current = false;
	}, [pageId]);

	useEffect(() => {
		if (!context.widgetId && !isLoading && !ref.current) {
			setPageContext({
				widgetId: widget?.id || null,
				pageName,
				appName,
			});
			ref.current = true;
		}
	}, [widget, isLoading, appName, pageName, context, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({
				widgetId: null,
				pageName: null,
				appName: null,
			});
		};
	}, [setPageContext]);

	return { widget, isLoading, ...rest };
};
