import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { axios } from '@/lib/axios';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({ tableId }: any) => {
	const response = await axios.post<any>(`/tables/query`, {
		table_id: tableId,
		filters: [],
		sorts: [],
	});

	return response.data;
};

export const useTableData = ({ tableId, filters = [], sorts = [] }: any) => {
	const queryKey = [TABLE_DATA_QUERY_KEY, tableId];

	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchTableData({ tableId, filters, sorts }),
	);

	const parsedData: any = useMemo(() => {
		if (response) {
			const rows: any = response.data.map((r: any) => {
				return r.reduce((agg: any, item: any, index: any) => {
					return {
						...agg,
						[response.header[index]]: item,
					};
				}, {});
			});

			return {
				rows,
				columns: response.columns,
				header: response.header,
				tableName: response.table_name,
				tableId: response.table_id,
			};
		}

		return {
			rows: [],
			header: [],
			columns: {},
		};
	}, [response]);

	return {
		...rest,
		...parsedData,
		sqlId: response?.sql_id,
		queryKey,
	};
};
