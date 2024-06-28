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
	series?: (BarOptions | LineOptions | ScatterOptions)[];
}

const composeSeries = (
	seriesProps: BarProperties | LineProperties | ScatterProperties,
	chartData: any,
): BarOptions | LineOptions | ScatterOptions | object => {
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
	const newOptions: ChartOption = {};
	if (chartProperties.xAxis) {
		newOptions.xAxis = chartProperties.xAxis;
	}
	if (chartProperties.yAxis) {
		if (chartProperties.yAxis.data_column) {
			newOptions.yAxis = chartData[chartProperties.yAxis.data_column];
		} else {
			newOptions.yAxis = { type: chartProperties.yAxis.type };
		}
		if (chartProperties.series && chartProperties.series.length > 0) {
			newOptions.series = chartProperties.series.map((ser) => composeSeries(ser, chartData));
		}
	}
	return newOptions;
};
