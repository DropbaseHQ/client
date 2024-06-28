export interface ScatterProperties {
	data_column: string;
	series_type: 'scatter';
}

export interface ScatterOptions {
	data: number[];
	type: 'scatter';
}

export const composeScatterSeries = (
	seriesProps: ScatterProperties,
	chartData: any,
): ScatterOptions => {
	const dataColumn = seriesProps.data_column; // column where series data is stored in df
	const newSeries: ScatterOptions = {
		data: chartData[dataColumn],
		type: seriesProps.series_type,
	};
	return newSeries;
};
