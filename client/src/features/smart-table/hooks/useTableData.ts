import { useQuery } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';

export const TABLE_DATA_QUERY_KEY = 'tableData';

type Row = any[];

type TableData = {
	header: {
		schema: string;
		table: string;
		column: string;
	}[];
	data: Row[];
	schema: {
		[folder: string]: {
			[table: string]: {
				[column: string]: {
					name: string;
					type: string;
					primary_key: boolean;
					foreign_key: boolean;
					default: any;
					nullable: boolean;
					unique: boolean;
					create_required: boolean;
					modify_required: boolean;
					keylike: boolean;
					editable: boolean;
					hidden: boolean;
				};
			};
		};
	};
};

const fetchTableData = async ({ appId }: { appId: string }) => {
	const response = await axios.get<TableData>(`/table/${appId}`);

	return response.data;
};

export const useTableData = (appId: string = '') => {
	const queryKey = [TABLE_DATA_QUERY_KEY, appId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchTableData({ appId }));

	const parsedData = useMemo(() => {
		if (response) {
			return {
				schema: response.schema,
				rows: response.data.map((r) => {
					return r.reduce((agg, item, index) => {
						return {
							...agg,
							[response.header[index].column]: {
								value: item,
								table: response.header[index].table,
								folder: response.header[index].schema,
							},
						};
					}, {});
				}),
				columns: response.header.map(({ schema: folder, column, table }) => {
					return {
						...(response.schema?.[folder]?.[table]?.[column] || {}),
						folder,
						column,
						table,
					};
				}),
			};
		}

		return {
			schema: {},
			rows: [],
			columns: [],
		};
	}, [response]);

	return {
		...rest,
		...parsedData,
		queryKey,
	};
};
