import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
	newSelectedRowAtom,
	allWidgetStateAtom,
	nonWidgetStateAtom,
} from '@/features/new-app-state';
import { useAppState } from '@/features/new-app-state/hooks';

export const useInitializePageState = (pageId: any) => {
	const {
		state: { tables, state },
		...rest
	} = useAppState(pageId || '');

	const setRowData = useSetAtom(newSelectedRowAtom);
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetStateAtom);

	useEffect(() => {
		setRowData((oldTables: any) => {
			if (oldTables && tables) {
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
	}, [tables, setRowData]);

	useEffect(() => {
		const { widget, ...other } = state || {};

		setWidgetState((s) => ({ ...s, state: widget || {} }));
		setNonInteractiveState(other || {});
	}, [state, setNonInteractiveState, setWidgetState]);

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
