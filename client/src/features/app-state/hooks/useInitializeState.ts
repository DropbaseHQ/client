import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { pageStateAtom, pageContextAtom } from '@/features/app-state';
import { useGetPage } from '@/features/page';

export const useInitializePageState = (appName: string, pageName: string) => {
	const { context, state, tables, ...rest } = useGetPage({ appName, pageName });

	const tablesRef = useRef(tables);
	tablesRef.current = tables;

	const setPageState = useSetAtom(pageStateAtom);
	const setPageContext = useSetAtom(pageContextAtom);

	useEffect(() => {
		setPageState((currentState: any) => {
			const oldTables = tablesRef.current;

			/**
			 * when new table is added we get new state and context as we get initially which resets
			 * the table state
			 */
			const tablesState = oldTables.reduce((agg: any, t: any) => {
				if (t.name in currentState) {
					return {
						...agg,
						[t.name]: {
							...(state?.[t.name] || {}),
							...(currentState?.[t.name] || {}),
						},
					};
				}

				return agg;
			}, {});

			return {
				...state,
				...tablesState,
			};
		});
	}, [state, setPageState]);

	useEffect(() => {
		setPageContext(context || {});
	}, [context, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({});
			setPageState({});
		};
	}, [setPageContext, setPageState]);

	return rest;
};

export const useInitializeWidgetState = ({ appName, pageName }: any) => {
	useInitializePageState(appName, pageName);
};
