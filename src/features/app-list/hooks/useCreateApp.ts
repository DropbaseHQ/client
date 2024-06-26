import { useMutation } from 'react-query';
import { workerAxios } from '@/lib/axios';

const createApp = async ({ name }: { name: string }) => {
	const response = await workerAxios.post('/app/', { app_name: name });
	return response.data;
};

export const useCreateApp = (mutationConfig?: any) => {
	return useMutation(createApp, {
		...(mutationConfig || {}),
	});
};

const createWorkerApp = async ({ appLabel, appName }: { appLabel: string; appName: string }) => {
	const response = await workerAxios.post('/app/', {
		app_label: appLabel,
		app_name: appName,
	});
	return response.data;
};

export const useCreateAppFlow = (mutationConfig?: any) => {
	const useCreateWorkerAppMutation = useMutation(createWorkerApp, { ...(mutationConfig || {}) });

	const handleCreateApp = async ({ name, label }: { label: string; name: string }) => {
		const { data: workerData } = await useCreateWorkerAppMutation.mutateAsync({
			appName: name,
			appLabel: label,
		});

		return workerData;
	};

	return {
		handleCreateApp,
		isLoading: useCreateWorkerAppMutation.isLoading,
	};
};
