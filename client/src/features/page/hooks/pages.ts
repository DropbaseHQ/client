import { useMemo, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';

import { workerAxios } from '@/lib/axios';
import { pageAtom } from '../atoms';

export const PAGE_DATA_QUERY_KEY = 'pageData';

const fetchPage = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<any>(`/page/${appName}/${pageName}`);

	return response.data;
};

export const useGetPage = ({ appName, pageName }: any) => {
	const queryKey = [PAGE_DATA_QUERY_KEY, appName, pageName];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPage({ appName, pageName }), {
		enabled: Boolean(appName && pageName),
	});

	const data: any = useMemo(() => {
		return {
			state: response?.state || {},
			context: response?.context || {},
			tables: response?.properties?.tables || [],
			widgets: response?.properties?.widgets || [],
			files: response?.properties?.files || [],
			properties: response?.properties || {},
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...data,
	};
};

export const useInitPage = () => {
	const { appName, pageName } = useParams();
	const [context, setPageContext] = useAtom(pageAtom);

	const ref = useRef(false);

	const { widgets, isLoading, isRefetching, ...rest } = useGetPage({
		appName,
		pageName,
	});

	useEffect(() => {
		ref.current = false;
	}, [appName, pageName, isRefetching]);

	useEffect(() => {
		if (!ref.current && !isLoading && !isRefetching) {
			const selectedWidgetIdExists = widgets?.some((w: any) => w.name === context.widgetName);
			const firstWidgetName = selectedWidgetIdExists
				? context?.widgetName
				: widgets?.[0]?.name;

			if (appName && pageName) {
				setPageContext({
					widgetName: firstWidgetName || null,
					pageName,
					appName,
					widgets,
				});
				ref.current = true;
			}
		}
	}, [isLoading, isRefetching, appName, widgets, pageName, context, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({
				widgetName: null,
				pageName: null,
				appName: null,
				widgets: null,
			});
		};
	}, [setPageContext]);

	return { isLoading, ...rest };
};

const updatePage = async (data: any) => {
	const response = await workerAxios.post(`/page`, data);
	return response.data;
};

export const useUpdatePageData = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updatePage, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};
