import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const createAppComponent = async ({
	code,
	appId,
}: {
	code: string;
	appId: string;
	// type?: string;
}) => {
	const response = await axios.post(`/components`, { code, sidebar_id: appId });
	return response.data;
};

const updateAppComponent = async ({
	code,
	functionId,
}: {
	code: string;
	functionId: string;
	// type?: string;
}) => {
	const response = await axios.put(`/components/${functionId}`, { code });
	return response.data;
};

export const useCreateAppComponent = () => {
	return useMutation(createAppComponent);
};

export const useUpdateAppComponent = () => {
	return useMutation(updateAppComponent);
};
