import { workerAxios } from '@/lib/axios';
import { getDelayInterval, wait } from '@/utils/timing';

export const fetchJobStatus = async (jobId: any) => {
	let counter = 0;

	while (true) {
		if (counter) {
			// eslint-disable-next-line no-await-in-loop
			await wait(getDelayInterval(counter) * 100);
		}
		// eslint-disable-next-line no-await-in-loop
		const previewResponse = await workerAxios.get<any>(`/status/${jobId}`);

		if (previewResponse.status === 200) {
			return previewResponse?.data;
		}
		counter += 1;
	}
};
