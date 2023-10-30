import { axios, workerAxios } from '@/lib/axios';
import { useMutation } from 'react-query';

const createApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post('/app/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateApp = (mutationConfig?: any) => {
	return useMutation(createApp, {
		...(mutationConfig || {}),
	});
};

type createDraftAppResponse = {
	app_id: string;
	page_id: string;
	message: string;
};

const createDraftApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post<createDraftAppResponse>('/app/draft', {
		name,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useCreateDraftApp = (mutationConfig?: any) => {
	return useMutation(createDraftApp, {
		...(mutationConfig || {}),
	});
};

const createWorkerApp = async ({ appId }: { appId: string }) => {
	const response = await workerAxios.post('/workspace_admin/create_app/', { app_id: appId });
	return response.data;
};

export const useCreateAppFlow = (mutationConfig?: any) => {
	const useCreateDraftAppMutation = useCreateDraftApp();
	const useCreateWorkerAppMutation = useMutation(createWorkerApp, { ...(mutationConfig || {}) });
	let defaultPageId;
	const handleCreateApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
		const response = await useCreateDraftAppMutation.mutateAsync({ name, workspaceId });
		if (!response?.app_id) return null;
		defaultPageId = response.page_id;

		const { data: workerData } = await useCreateWorkerAppMutation.mutateAsync({
			appId: response.app_id,
		});

		return workerData;
	};
	return {
		handleCreateApp,
		defaultPageId,
		isLoading: useCreateDraftAppMutation.isLoading || useCreateWorkerAppMutation.isLoading,
	};
};
