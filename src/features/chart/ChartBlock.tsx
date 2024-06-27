import ReactECharts from 'echarts-for-react';
import { Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { focusAtom } from 'jotai-optics';
import { useChartData } from './hooks/get-data';
import { pageContextAtom } from '../app-state';
import { useGetPage } from '../page';

const getBarChartOptions = (chartContext: any) => {
	return {
		xAxis: {
			type: 'category',
			data: chartContext?.data?.xAxis || [],
		},
		yAxis: {
			type: 'value',
		},
		series: [
			{
				data: chartContext?.data?.data || [],
				type: 'bar',
			},
		],
	};
};

interface Series {
	data_column: string;
	series_type?: 'line' | 'bar' | 'otherType';
}

interface XAxisOption {
	type: string;
}

interface YAxisOption {
	type: string;
	data_column?: string;
}

interface YAxisOptionChart {
	type: string;
	data_column?: string;
}

interface Option {
	xAxis?: XAxisOption;
	yAxis?: YAxisOption;
	series?: Series[];
}

interface ChartSeries {
	data?: number[];
	type?: 'line' | 'bar' | 'otherType';
}
interface ChartOption {
	xAxis?: XAxisOption;
	yAxis?: YAxisOptionChart;
	series?: ChartSeries[];
}

const composeSeries = (ser: Series, chartContext: any): ChartSeries => {
	const newSeries: ChartSeries = {};
	newSeries.data = chartContext[ser.data_column];
	newSeries.type = ser.series_type;
	return newSeries;
};

const composeOption = (option: Option, convertedData: any): ChartOption => {
	// debugger;
	const newOptions: ChartOption = {};
	if (option.xAxis) {
		newOptions.xAxis = option.xAxis;
	}
	if (option.yAxis) {
		if (option.yAxis.data_column) {
			newOptions.yAxis = convertedData[option.yAxis.data_column];
		} else {
			newOptions.yAxis = { type: option.yAxis.type };
		}
		if (option.series && option.series.length > 0) {
			newOptions.series = option.series.map((ser) => composeSeries(ser, convertedData));
		}
		return newOptions;
	}
};

const convertToColumnData = (data: any) => {
	const columns = ['total_price'];
	// Object.keys(data?.[0]);
	const updatedRecs: { [key: string]: any[] } = columns.reduce(
		(acc, col) => {
			acc[col] = data.map((row) => row[col]);
			return acc;
		},
		{} as { [key: string]: any[] },
	);
	return updatedRecs;
};

export const ChartBlock = ({ chartName }: any) => {
	const { appName, pageName } = useParams();

	const chartContextAtom = useMemo(() => {
		return focusAtom(pageContextAtom, (optic: any) => optic.prop(chartName));
	}, [chartName]);
	const chartContext: any = useAtomValue(chartContextAtom);

	useChartData({ chartName, appName, pageName });

	const { properties } = useGetPage({ appName, pageName });

	const chartProperties = properties?.[chartName] || {};
	// const chartConfigOptions = chartProperties?.options || {};

	const convertedData = convertToColumnData(chartContext?.data || []);

	// construct chart options
	// if (chartContext?.data) {
	// 	debugger;
	// }
	let chartOptions = {};
	if (chartContext?.data) {
		chartOptions = composeOption(chartProperties, convertedData);
	}

	return (
		<>
			<Text>{chartName}</Text>
			<ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
		</>
	);
};
