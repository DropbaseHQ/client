import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const createAppFunction = async ({
	code,
	appId,
	type,
}: {
	code: string;
	appId: string;
	type: string;
}) => {
	const response = await axios.post(`/functions`, { code, sidebar_id: appId, type });
	return response.data;
};

const updateAppFunction = async ({
	code,
	functionId,
	type,
}: {
	code: string;
	functionId: string;
	type: string;
}) => {
	const response = await axios.put(`/functions/${functionId}`, { code, type });
	return response.data;
};

export const useCreateAppFunction = () => {
	return useMutation(createAppFunction);
};

export const useUpdateAppFunction = () => {
	return useMutation(updateAppFunction);
};
