import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const sendCloudRequest = async ({ workspaceId, userNum, workerURL }: any) => {
	const { data } = await axios.post(`/workspace/${workspaceId}/request_cloud`, {
		user_number: userNum,
		worker_url: workerURL,
	});
	return data;
};

export const useSendCloudRequest = () => {
	return useMutation(sendCloudRequest);
};
