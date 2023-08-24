import { useMutation, useIsMutating } from 'react-query';
import { axios } from '@/lib/axios';
import { useAtom, useSetAtom } from 'jotai';
import {
	fetchersAtom,
	uiCodeAtom,
	fetchersLastSavedAtom,
	uiCodeLastSavedAtom,
} from '../atoms/tableContextAtoms';
import { useParams } from 'react-router-dom';
import { useGetApp } from '@/features/app/hooks';
import { findFunctionDeclarations } from '../components/Fetchers';

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
	const [fetchers] = useAtom(fetchersAtom);
	const [uiCode] = useAtom(uiCodeAtom);
	const setFetcherLastSaved = useSetAtom(fetchersLastSavedAtom);
	const setUiCodeLastSaved = useSetAtom(uiCodeLastSavedAtom);
	const { appId } = useParams();
	const {
		fetchers: savedFetchers,
		uiComponents,
		refetch,
		isLoading: appDetailsIsLoading,
	} = useGetApp(appId || '');
	const lastSavedTimeStamp = new Date().getTime();
	const componentMutationConfig = {
		onSuccess: () => {
			setUiCodeLastSaved(lastSavedTimeStamp);
			refetch();
		},
		mutationKey: ['studio'],
	};
	const fetcherMutationConfig = {
		onSuccess: () => {
			setFetcherLastSaved(lastSavedTimeStamp);
			refetch();
		},
		mutationKey: ['studio'],
	};
	const isMutatingStudio = useIsMutating({
		mutationKey: ['studio'],
	});
	const updateAppComponentMutation = useMutation(updateAppComponent, componentMutationConfig);
	const createAppComponentMutation = useMutation(createAppComponent, componentMutationConfig);
	const updateAppFunctionMutation = useMutation(updateAppFunction, fetcherMutationConfig);
	const createAppFunctionMutation = useMutation(createAppFunction, fetcherMutationConfig);

	// UI components are currently saved as an array, but for now we only support one UI component
	// Maybe we can just save it as an object instead of an array
	const currentUIComponent = uiComponents?.[0];

	const saveUICode = async () => {
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
	};

	const saveFetchers = async () => {
		for (const [fetcherId, fetcherCode] of Object.entries(fetchers) as [string, string][]) {
			const functionDeclarations = findFunctionDeclarations(fetcherCode);

			if (Array.from(functionDeclarations).length > 1) {
				console.log('Multiple functions in one fetcher not supported yet');
				return;
			}

			const IdInSavedFetchers = savedFetchers?.find((f: any) => f.id === fetcherId);

			if (IdInSavedFetchers) {
				console.log('here');
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
		}

		// Object.entries(fetchers).forEach(async (fetcher: any) => {
		// 	const fetcherId = fetcher[0];
		// 	const fetcherCode = fetcher[1];
		// 	const functionDeclarations = findFunctionDeclarations(fetcherCode);

		// 	if (Array.from(functionDeclarations).length > 1) {
		// 		console.log('Multiple functions in one fetcher not supported yet');
		// 		return;
		// 	}

		// 	const IdInSavedFetchers = savedFetchers?.find((f: any) => f.id === fetcherId);

		// 	if (IdInSavedFetchers) {
		// 		console.log('here');
		// 		await updateAppFunctionMutation.mutateAsync({
		// 			functionId: fetcherId || '',
		// 			code: fetcherCode || '',
		// 			type: 'fetcher',
		// 		});
		// 	} else {
		// 		await createAppFunctionMutation.mutateAsync({
		// 			appId: appId || '',
		// 			code: fetcherCode || '',
		// 			type: 'fetcher',
		// 		});
		// 	}
		// });
	};
	const saveStudio = async () => {
		return await Promise.all([saveUICode(), saveFetchers()]);
	};
	const isLoading = isMutatingStudio || appDetailsIsLoading;
	return {
		saveUICode,
		saveFetchers,
		saveStudio,
		isLoading,
	};
};
