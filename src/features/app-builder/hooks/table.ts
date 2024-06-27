import { useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { workerAxios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { ALL_PAGE_FILES_QUERY_KEY } from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';

export const TABLE_QUERY_KEY = 'table';

export const useGetTable = (tableName: string): any => {
	const { appName, pageName } = useParams();
	const { tables, ...rest } = useGetPage({ appName, pageName });
	const table = tables.find((t: any) => t.name === tableName);

	const info = useMemo(() => {
		return {
			...(table || {}),
			type: table?.type,
			filters: (table?.filters || []).map((f: any) => ({
				...f,
				pinned: true,
				id: crypto.randomUUID(),
			})),
			height: table?.height,
			name: table?.name,
			label: table?.label,
			columns: table?.columns || [],
		};
	}, [table]);

	return {
		...rest,
		table,
		...info,
	};
};

const saveCode = async ({ pageName, appName, fileType, fileName, code }: any) => {
	const response = await workerAxios.put(`files/`, {
		page_name: pageName,
		app_name: appName,
		file_name: `${fileName}.${fileType === 'python' ? 'py' : fileType}`,
		code,
	});

	return response.data;
};

export const useSaveCode = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(saveCode, {
		onSettled: (_, __, variables: any) => {
			queryClient.invalidateQueries(TABLE_QUERY_KEY);
			queryClient.invalidateQueries([TABLE_DATA_QUERY_KEY, variables?.fileName]);
			queryClient.invalidateQueries(ALL_PAGE_FILES_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
		...props,
	});
};
