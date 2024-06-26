import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

export const ChartBlock = ({ chartName }: any) => {
	console.log('chartName', chartName);
	ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top' as const,
			},
			title: {
				display: true,
				text: 'Chart.js Bar Chart',
				position: 'top',
			},
		},
	};

	const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
	const data = {
		labels,
		datasets: [
			{
				label: 'Dataset 1',
				data: [1, 2, 3, 4, 5, 6, 7],
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
			{
				label: 'Dataset 2',
				data: [5, 6, 7, 8, 1, 2, 3],
				backgroundColor: 'rgba(53, 162, 235, 0.5)',
			},
		],
	};

	return <Bar options={options} data={data} width="full" />;
};
