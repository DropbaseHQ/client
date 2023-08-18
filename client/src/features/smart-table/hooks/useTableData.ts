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
	sql_id: string;
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

const fetchTableData = async ({ appId, filters, sorts }: any) => {
	const response = await axios.post<TableData>(`/table`, {
		app_id: appId,
		filters,
		sorts,
	});

	return response.data;
};

export const useTableData = ({ appId, filters, sorts }: any) => {
	const queryKey = [TABLE_DATA_QUERY_KEY, appId, JSON.stringify({ filters, sorts })];

	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchTableData({ appId, filters, sorts }),
	);

	const parsedData: any = useMemo(() => {
		if (response) {
			const columns = response.header.map(({ schema: folder, column, table }) => {
				return {
					...(response.schema?.[folder]?.[table]?.[column] || {}),
					folder,
					column,
					table,
				};
			});

			const rows: any = response.data.map((r) => {
				return r.reduce((agg, item, index) => {
					return {
						...agg,
						[response.header[index].column]: item,
					};
				}, {});
			});

			return {
				schema: response.schema,
				rows,
				columns,
				rowsWithSchema: response.data.map((r: any) => {
					return response.header.reduce((agg: any, col, colIndex) => {
						return {
							...agg,
							[col.schema]: {
								...(agg?.[col.schema] || {}),
								[col.table]: {
									...(agg?.[col.schema]?.[col.table] || {}),
									[col.column]: r[colIndex],
								},
							},
						};
					}, {});
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
		sqlId: response?.sql_id,
		queryKey,
	};
};
