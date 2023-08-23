import { useGetApp } from '@/features/app/hooks';
import { axios } from '@/lib/axios';
import { useAtom } from 'jotai';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { fetchersAtom, uiCodeAtom } from '../atoms/tableContextAtoms';

const createAppFunction = async ({
	code,
	appId,
	type,
}: {
	code: string;
	appId: string;
	type: string;
}) => {
	const response = await axios.post(`/functions/`, { code, app_id: appId, type });
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

const deleteAppFunction = async (functionId: string) => {
	const { data } = await axios.delete(`/functions/${functionId}`);
	return data;
};

const createAppComponent = async ({
	code,
	appId,
}: {
	code: string;
	appId: string;
	// type?: string;
}) => {
	const response = await axios.post(`/components/`, { code, app_id: appId });
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

export const useSaveStudio = () => {
	const updateAppComponentMutation = useMutation(updateAppComponent);
	const createAppComponentMutation = useMutation(createAppComponent);
	const updateAppFunctionMutation = useMutation(updateAppFunction);
	const createAppFunctionMutation = useMutation(createAppFunction);
	const deleteAppFunctionMutation = useMutation(deleteAppFunction);

	const [fetchers] = useAtom(fetchersAtom);
	const [uiCode] = useAtom(uiCodeAtom);
	const { appId } = useParams();

	const {
		fetchers: savedFetchers,
		uiComponents,
		refetch,
		isLoading: appDetailsIsLoading,
	} = useGetApp(appId || '');

	// UI components are currently saved as an array, but for now we only support one UI component
	// Maybe we can just save it as an object instead of an array
	const currentUIComponent = uiComponents?.[0];
	const saveStudio = async () => {
		if (currentUIComponent) {
			await updateAppComponentMutation.mutateAsync({
				functionId: currentUIComponent.id || '',
				code: uiCode || '',
			});
		} else {
			await createAppComponentMutation.mutateAsync({
				appId: appId || '',
				code: uiCode || '',
			});
		}

		Object.entries(fetchers).forEach(async (fetcher: any) => {
			const fetcherId = fetcher[0];
			const fetcherCode = fetcher[1];

			const IdInSavedFetchers = savedFetchers?.find((f: any) => f.id === fetcherId);

			if (IdInSavedFetchers) {
				await updateAppFunctionMutation.mutateAsync({
					functionId: fetcherId || '',
					code: fetcherCode || '',
					type: 'fetcher',
				});
			} else {
				await createAppFunctionMutation.mutateAsync({
					appId: appId || '',
					code: fetcherCode || '',
					type: 'fetcher',
				});
			}
		});
		savedFetchers.forEach(async (fetcher: any) => {
			if (!fetchers[fetcher.id]) {
				await deleteAppFunctionMutation.mutateAsync(fetcher.id);
			}
		});

		refetch();
	};
	const isLoading =
		updateAppComponentMutation.isLoading ||
		createAppComponentMutation.isLoading ||
		updateAppFunctionMutation.isLoading ||
		createAppFunctionMutation.isLoading ||
		appDetailsIsLoading;

	return {
		saveStudio,
		isLoading,
	};
};
