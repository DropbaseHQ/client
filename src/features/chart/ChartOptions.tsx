import { BarOptions, BarProperties, composeBarSeries } from './series/Bar';
import { LineOptions, LineProperties, composeLineSeries } from './series/Line';
import { ScatterOptions, ScatterProperties, composeScatterSeries } from './series/Scatter';

// chart properties

interface XAxisProperties {
	type: string;
}

interface YAxisProperties {
	type: string;
	data_column?: string;
}

interface ChartProperties {
	xAxis?: XAxisProperties;
	yAxis?: YAxisProperties;
	series?: (BarProperties | LineProperties | ScatterProperties)[];
}

// chart options

interface XAxisOption {
	type: string;
}

interface YAxisOption {
	type: string;
	data_column?: string;
}

interface ChartOption {
	xAxis?: XAxisOption;
	yAxis?: YAxisOption;
	series?: (BarOptions | LineOptions | ScatterOptions | object)[];
}

const composeSeries = (
	seriesProps: BarProperties | LineProperties | ScatterProperties,
	chartData: any,
): BarOptions | LineOptions | ScatterOptions | object => {
	// | object - is this correct or should it be undefined?
	if (seriesProps.series_type === 'bar') {
		return composeBarSeries(seriesProps, chartData);
	}
	if (seriesProps.series_type === 'line') {
		return composeLineSeries(seriesProps, chartData);
	}
	if (seriesProps.series_type === 'scatter') {
		return composeScatterSeries(seriesProps, chartData);
	}
	return {};
};

export const composeOption = (chartProperties: ChartProperties, chartData: any): ChartOption => {
	// debugger;
	const chartOptions: ChartOption = {};
	if (chartProperties.xAxis) {
		chartOptions.xAxis = chartProperties.xAxis;
	}

	if (chartProperties.yAxis) {
		if (chartProperties.yAxis.data_column) {
			chartOptions.yAxis = chartData ? chartData[chartProperties.yAxis.data_column] : [];
		} else {
			chartOptions.yAxis = { type: chartProperties.yAxis.type };
		}
	}

	if (!chartData) {
		return chartOptions;
	}

	if (chartProperties?.series?.length) {
		chartOptions.series = chartProperties.series.map((ser) => composeSeries(ser, chartData));
	}
	return chartOptions;
};
