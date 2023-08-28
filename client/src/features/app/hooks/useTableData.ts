import { useQuery } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';

export const TABLE_DATA_QUERY_KEY = 'pipeline';

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

const fetchTableData = async ({ pageId }: { pageId: string }) => {
	const response = await axios.get<TableData>(`/table/${pageId}`);

	return response.data;
};

export const useTableData = (pageId: string) => {
	const queryKey = [TABLE_DATA_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchTableData({ pageId }), {
		enabled: Boolean(pageId),
	});

	const parsedData = useMemo(() => {
		if (response) {
			return {
				schema: response.schema,
				rows: response.data,
				columns: response.header,
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
