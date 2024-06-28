export interface ScatterProperties {
	x_axis: string;
	y_axis: string;
	series_type: 'scatter';
}

export interface ScatterOptions {
	data: number[][];
	type: 'scatter';
}

const zipArrays = (arr1: number[], arr2: number[]): number[][] => {
	// debugger;
	if (arr1?.length && arr2?.length) {
		// Check if the input arrays have the same length, if not, we should handle it
		if (arr1.length !== arr2.length) {
			return [];
		}

		const result: number[][] = [];

		arr1.forEach((value, index) => {
			result.push([value, arr2[index]]);
		});

		return result;
	}
	return [];
};

export const composeScatterSeries = (
	seriesProps: ScatterProperties,
	chartData: any,
): ScatterOptions => {
	// debugger;
	const { x_axis: xAxis, y_axis: yAxis } = seriesProps; // column where series data for x and y are stored in df
	const newSeries: ScatterOptions = {
		data: zipArrays(chartData[xAxis], chartData[yAxis]),
		type: seriesProps.series_type,
	};
	// debugger;
	return newSeries;
};
