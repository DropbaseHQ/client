import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

	return {
		...tableMetaInfo,
		...tableData,
		isLoading: isLoadingPage || tableMetaInfo.isLoading,
		columns: table?.columns,
		columnDict,
	};
};

export const useTableSyncStatus = (tableName: any) => {
	const { header, columns, isLoading, isRefetching, columnDict } = useCurrentTableData(tableName);

	const [needsSync, setNeedSync] = useState(false);

	useEffect(() => {
		if (!isLoading || !isRefetching) {
			const isSynced =
				header.every((c: any) => (columnDict as any)[c?.name]) &&
				header.length === columns?.length;

			setNeedSync(!isSynced);
		}
	}, [header, isLoading, isRefetching, columns, columnDict, tableName]);

	return header.length > 0 ? needsSync : false;
};
