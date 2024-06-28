export interface LineProperties {
	data_column: string;
	series_type: 'line';
}

export interface LineOptions {
	data: number[];
	type: 'line';
}

export const composeLineSeries = (seriesProps: LineProperties, chartData: any): LineOptions => {
	const dataColumn = seriesProps.data_column; // column where series data is stored in df
	const newSeries: LineOptions = {
		data: chartData[dataColumn],
		type: seriesProps.series_type,
	};
	return newSeries;
};
