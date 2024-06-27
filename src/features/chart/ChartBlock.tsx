import ReactECharts from 'echarts-for-react';
import { Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { useChartData } from './hooks/get-data';
import { useGetPage } from '../page';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { focusAtom } from 'jotai-optics';
import { pageContextAtom } from '../app-state';

export const ChartBlock = ({ chartName }: any) => {
	const { appName, pageName } = useParams();

	const pageContext = useAtomValue(pageContextAtom);
	// console.log('pageContext', pageContext);

	const chartContextAtom = useMemo(() => {
		return focusAtom(pageContextAtom, (optic: any) => optic.prop(chartName));
	}, [chartName]);
	const chartContext: any = useAtomValue(chartContextAtom);

	useChartData({ chartName, appName, pageName });

	const { properties } = useGetPage({ appName, pageName });

	const chartProperties = properties?.[chartName] || {};
	const chartConfigOptions = chartProperties?.options || {};

	const chartOptions = {
		...chartConfigOptions,
		xAxis: {
			...(chartConfigOptions?.xAxis || {}),
			data: chartContext?.data?.xAxis || [],
		},
		series: [
			{
				type: chartConfigOptions?.series?.type,
				data: chartContext?.data?.data || [],
			},
		],
	};

	return (
		<>
			<Text>{chartName}</Text>
			<ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
		</>
	);
};
