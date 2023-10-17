import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
	newSelectedRowAtom,
	allWidgetStateAtom,
	nonWidgetStateAtom,
	allWidgetsInputAtom,
} from '@/features/new-app-state';
import { useAppState } from '@/features/new-app-state/hooks';

export const useInitializePageState = (pageId: any) => {
	const {
		state: { context, state },
		...rest
	} = useAppState(pageId || '');

	const setRowData = useSetAtom(newSelectedRowAtom);
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetStateAtom);
	const setWidgetsInputs = useSetAtom(allWidgetsInputAtom);

	useEffect(() => {
		setRowData((oldTables: any) => {
			const { tables } = state;
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
						[tableName]: tables[tableName],
					};
				}, {});
			}

			return tables;
		});
	}, [state, setRowData]);

	useEffect(() => {
		setWidgetsInputs(state.widgets);
	}, [state, setWidgetsInputs]);

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

export const useInitializeWidgetState = ({ widgetId, pageId }: any) => {
	useInitializePageState(pageId);

	const setWidgetState = useSetAtom(allWidgetStateAtom);

	useEffect(() => {
		setWidgetState((s) => ({ ...s, selected: widgetId }));
	}, [widgetId, setWidgetState]);
};
