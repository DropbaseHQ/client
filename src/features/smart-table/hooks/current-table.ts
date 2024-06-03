import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { focusAtom } from 'jotai-optics';

import { useAtomValue } from 'jotai';
import { useParsedData, useTableData } from './table';
import { tablePageInfoAtom } from '@/features/smart-table/atoms';
import { useGetPage } from '@/features/page';
import { pageContextAtom } from '@/features/app-state';

export const CurrentTableContext: any = createContext({ tableName: null });

export const useCurrentTableName = () => {
	const data: any = useContext(CurrentTableContext);

	return data.tableName;
};

export const useCurrentTableData = (tableName: any) => {
	const { pageName, appName } = useParams();

	const tableContextAtom = useMemo(() => {
		return focusAtom(pageContextAtom, (optic: any) => optic.prop(tableName));
	}, [tableName]);
	const tableContext: any = useAtomValue(tableContextAtom);

	const pageInfo = useAtomValue(tablePageInfoAtom)?.[tableName];

	const { tables, isLoading: isLoadingPage } = useGetPage({ appName, pageName });

	const table = useMemo(() => {
		return tables?.find((t: any) => t.name === tableName);
	}, [tables, tableName]);

	const columnDict = useMemo(() => {
		return table?.columns?.reduce((agg: any, c: any) => {
			return {
				...agg,
				[c.name]: c,
			};
		}, {});
	}, [table]);

	const tableMetaInfo = useTableData({
		tableName,
		pageName,
		appName,
		...pageInfo,
	});

	const tableData = useParsedData(tableContext?.data, table);

	const { header } = tableData;

	const { columns: storedColumns } = table;

	const isSynced =
		header.every((c: any) => {
			if ((columnDict as any)[c?.name]) {
				return columnDict[c?.name]?.data_type === c?.data_type;
			}

			return false;
		}) && header.length === storedColumns?.length;

	return {
		...tableMetaInfo,
		...tableData,
		isLoading: isLoadingPage || tableMetaInfo.isLoading,
		columns: table?.columns,
		columnDict,
		isSynced,
	};
};
