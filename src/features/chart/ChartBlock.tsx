import ReactECharts from 'echarts-for-react';
import { Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { focusAtom } from 'jotai-optics';
import { useChartData } from './hooks/get-data';
import { pageContextAtom } from '../app-state';
import { useGetPage } from '../page';
import { composeOption } from './ChartOptions';

export const ChartBlock = ({ chartName }: any) => {
	const { appName, pageName } = useParams();

	const chartContextAtom = useMemo(() => {
		return focusAtom(pageContextAtom, (optic: any) => optic.prop(chartName));
	}, [chartName]);
	const chartContext: any = useAtomValue(chartContextAtom);

	useChartData({ chartName, appName, pageName });

	const { properties } = useGetPage({ appName, pageName });

	const chartProperties = properties?.[chartName] || {};

	// construct chart options
	// if (chartName === 'chart2') {
	// 	console.log('chartProperties', chartProperties);
	// 	console.log('chartContext', chartContext);
	// }

	const chartOptions = composeOption(chartProperties, chartContext?.data);

	return (
		<>
			<Text>{chartName}</Text>
			<ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
		</>
	);
};
