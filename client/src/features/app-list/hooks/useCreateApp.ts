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

const createWorkerApp = async ({
	appName,
	workspaceId,
}: {
	appName: string;
	workspaceId: string;
}) => {
	const response = await workerAxios.post('/app/', {
		app_name: appName,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useCreateAppFlow = (mutationConfig?: any) => {
	const useCreateWorkerAppMutation = useMutation(createWorkerApp, { ...(mutationConfig || {}) });

	const handleCreateApp = async ({
		name,
		workspaceId,
	}: {
		name: string;
		workspaceId: string;
	}) => {
		const { data: workerData } = await useCreateWorkerAppMutation.mutateAsync({
			appName: name,
			workspaceId,
		});

		return workerData;
	};

	return {
		handleCreateApp,
		isLoading: useCreateWorkerAppMutation.isLoading,
	};
};
