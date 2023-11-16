import { useMutation } from 'react-query';
import { axios, workerAxios } from '@/lib/axios';

const createApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post('/app/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateApp = (mutationConfig?: any) => {
	return useMutation(createApp, {
		...(mutationConfig || {}),
	});
};

type AppTemplate = {
	page: {
		name: string;
		id: string;
	};
	table: {
		name: string;
		property: {
			name: string;
			type: string;
			code: string;
		};
		type: string;
		page: string;
		page_id: string;
	};
	files: {
		name: string;
		page: string;
		source: string;
		type: string;
		code: string;
	}[];
};

type CreateDraftAppResponse = {
	app_id: string;
	message: string;
	app_template: AppTemplate;
};

const createDraftApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post<CreateDraftAppResponse>('/app/draft', {
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

const createWorkerApp = async ({
	appId,
	appTemplate,
}: {
	appId: string;
	appTemplate: AppTemplate;
}) => {
	const response = await workerAxios.post('/app/', {
		app_id: appId,
		app_template: appTemplate,
	});
	return response.data;
};

export const useCreateAppFlow = (mutationConfig?: any) => {
	const useCreateDraftAppMutation = useCreateDraftApp();
	const useCreateWorkerAppMutation = useMutation(createWorkerApp, { ...(mutationConfig || {}) });
	const handleCreateApp = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
		const response = await useCreateDraftAppMutation.mutateAsync({ name, workspaceId });
		if (!response?.app_id) return null;

		const { data: workerData } = await useCreateWorkerAppMutation.mutateAsync({
			appId: response.app_id,
			appTemplate: response.app_template,
		});

		return workerData;
	};
	return {
		handleCreateApp,
		isLoading: useCreateDraftAppMutation.isLoading || useCreateWorkerAppMutation.isLoading,
	};
};
