import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { Save, Trash } from 'react-feather';
import { useParams } from 'react-router-dom';
import { Stack, IconButton, Text, ButtonGroup, StackDivider, Box, Button } from '@chakra-ui/react';
import { FormInput } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useResourceFields } from '@/features/app-builder/hooks';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { LabelContainer } from '@/components/LabelContainer';
import { NameEditor } from '@/features/app-builder/components/NameEditor';

export const ChartProperties = ({ chartId }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const { fields } = useResourceFields();
	const currentCategories = ['Default'];

	const { pageName, appName } = useParams();
	const { charts, properties, refetch } = useGetPage({ appName, pageName });

	const chart = charts.find((w: any) => w.name === chartId);
	console.log('chart', chart);

	return (
		<Stack>
			{chart?.series?.map((series: any) => (
				<Stack direction="row">
					<Box>{series?.series_type}</Box>
					<Box>{series?.data_column}</Box>
				</Stack>
			))}

			<Button>Add series</Button>
		</Stack>
	);
};
// {
//     "block_type": "chart",
//     "label": "chart 1",
//     "name": "chart1",
//     "description": null,
//     "xAxis": {
//         "type": "category",
//         "data_column": null
//     },
//     "yAxis": {
//         "type": "value"
//     },
//     "series": [
//         {
//             "series_type": "line",
//             "data_column": "total_price"
//         },
//         {
//             "series_type": "bar",
//             "data_column": "az"
//         }
//     ],
//     "w": 3,
//     "h": 1,
//     "x": 0,
//     "y": 1
// }
