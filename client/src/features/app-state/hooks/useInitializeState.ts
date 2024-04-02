import { useQuery } from 'react-query';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { pageStateAtom, pageContextAtom } from '@/features/app-state';
import { useGetPage } from '@/features/page';
import { workerAxios } from '@/lib/axios';

const fetchInitialState = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<any>(`/page/${appName}/${pageName}/init`);

	return response.data;
};

export const useInitializePageState = (appName: string, pageName: string) => {
	const queryKey = ['INITIAL_STATE', appName, pageName];

	const setPageState = useSetAtom(pageStateAtom);
	const setPageContext = useSetAtom(pageContextAtom);

	const { isLoading: isLoadingInitial } = useQuery(
		queryKey,
		() => fetchInitialState({ appName, pageName }),
		{
			enabled: Boolean(appName && pageName),
			staleTime: Infinity,
			onSuccess: (data: any) => {
				/**
				 * Update initial context to set the base
				 */
				setPageContext(data?.state_context?.context || {});
				setPageState(data?.state_context?.state || {});
			},
		},
	);

	const { context, state, ...rest } = useGetPage({
		appName,
		pageName,
		enabled: Boolean(appName && pageName && !isLoadingInitial),
	});

	/**
	 * Subsequesnt useEffect's are for updates made to resoruces, like
	 * adding component, widget or tables
	 */
	useEffect(() => {
		if (!isLoadingInitial) {
			setPageState((current: any) => {
				return {
					...current,
					...state,
				};
			});
		}
	}, [state, isLoadingInitial, setPageState]);

	useEffect(() => {
		if (!isLoadingInitial) {
			setPageContext(context || {});
		}
	}, [context, isLoadingInitial, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({});
			setPageState({});
		};
	}, [setPageContext, setPageState]);

	return { ...rest, isLoading: rest.isLoading || isLoadingInitial };
};

export const useInitializeWidgetState = ({ appName, pageName }: any) => {
	useInitializePageState(appName, pageName);
};
