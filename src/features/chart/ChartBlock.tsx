import { Text } from '@chakra-ui/react';
import ReactECharts from 'echarts-for-react';

export const ChartBlock = ({ chartName }: any) => {
	const option = {
		tooltip: {
			trigger: 'item',
		},
		legend: {
			top: '0',
			left: 'center',
		},
		series: [
			{
				name: 'Access From',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: '#fff',
					borderWidth: 2,
				},
				label: {
					show: false,
					position: 'center',
				},
				labelLine: {
					show: false,
				},
				data: [
					{ value: 1048, name: 'Search Engine' },
					{ value: 735, name: 'Direct' },
					{ value: 580, name: 'Email' },
					{ value: 484, name: 'Union Ads' },
					{ value: 300, name: 'Video Ads' },
				],
			},
		],
	};

	return (
		<>
			<Text>{chartName}</Text>
			<ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
		</>
	);
};
