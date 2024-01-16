import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
	selectedRowAtom,
	allWidgetStateAtom,
	nonWidgetContextAtom,
	allWidgetsInputAtom,
	tableStateAtom,
} from '@/features/app-state';
import { useAppState } from '@/features/app-state/hooks';

export const useInitializePageState = (appName: string, pageName: string) => {
	const {
		state: { context, state },
		...rest
	} = useAppState(appName, pageName);
	const setRowData = useSetAtom(selectedRowAtom);
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetContextAtom);
	const setWidgetsInputs = useSetAtom(allWidgetsInputAtom);
	const setTableState = useSetAtom(tableStateAtom);

	useEffect(() => {
		setRowData((oldTables: any) => {
			const { tables } = state;
			setTableState(tables);

			if (oldTables && state.tables) {
				return Object.keys(tables).reduce((agg: any, tableName: any) => {
					if (oldTables[tableName]) {
						return {
							...agg,
							[tableName]: Object.keys(tables?.[tableName] || {}).reduce(
								(acc: any, field) => ({
									...acc,
									[field]: oldTables?.[tableName]?.[field],
								}),
								{},
							),
						};
					}

					return {
						...agg,
						[tableName]: tables[tableName] || {},
					};
				}, {});
			}

			return tables;
		});

		setWidgetsInputs(state.widgets);
	}, [state, setRowData, setTableState, setWidgetsInputs]);

	useEffect(() => {
		const { widgets, ...other } = context || {};

		setWidgetState((s) => ({ ...s, state: widgets || {} }));
		setNonInteractiveState(other || {});
	}, [context, setNonInteractiveState, setWidgetState]);

	useEffect(() => {
		return () => {
			setWidgetState({
				selected: null,
				state: {},
			});
			setNonInteractiveState({});
			setRowData(null);
		};
	}, [setNonInteractiveState, setRowData, setWidgetState]);

	return rest;
};

export const useInitializeWidgetState = ({ widgetName, appName, pageName }: any) => {
	useInitializePageState(appName, pageName);

	const setWidgetState = useSetAtom(allWidgetStateAtom);

	useEffect(() => {
		setWidgetState((s) => ({ ...s, selected: widgetName }));
	}, [widgetName, setWidgetState]);
};
