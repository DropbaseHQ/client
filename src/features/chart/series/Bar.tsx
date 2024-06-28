export interface BarProperties {
	data_column: string;
	series_type: 'bar';
}

export interface BarOptions {
	data: number[];
	type: 'bar';
}

export const composeBarSeries = (seriesProps: BarProperties, chartData: any): BarOptions => {
	const dataColumn = seriesProps.data_column; // column where series data is stored in df
	const newSeries: BarOptions = {
		data: chartData[dataColumn],
		type: seriesProps.series_type,
	};
	return newSeries;
};
