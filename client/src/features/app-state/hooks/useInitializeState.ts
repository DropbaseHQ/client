import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { pageStateAtom, pageContextAtom } from '@/features/app-state';
import { useAppState } from '@/features/app-state/hooks';

export const useInitializePageState = (appName: string, pageName: string) => {
	const {
		state: { context, state },
		...rest
	} = useAppState(appName, pageName);

	const setPageState = useSetAtom(pageStateAtom);
	const setPageContext = useSetAtom(pageContextAtom);

	useEffect(() => {
		setPageState(() => {
			// FIXME: yash take alook again by having a new table
			// const { tables } = state;
			// setTableState(tables);

			// if (oldTables && state.tables) {
			// 	return Object.keys(tables).reduce((agg: any, tableName: any) => {
			// 		if (oldTables[tableName]) {
			// 			return {
			// 				...agg,
			// 				[tableName]: Object.keys(tables?.[tableName] || {}).reduce(
			// 					(acc: any, field) => ({
			// 						...acc,
			// 						[field]: oldTables?.[tableName]?.[field],
			// 					}),
			// 					{},
			// 				),
			// 			};
			// 		}

			// 		return {
			// 			...agg,
			// 			[tableName]: tables[tableName] || {},
			// 		};
			// 	}, {});
			// }

			return state;
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
