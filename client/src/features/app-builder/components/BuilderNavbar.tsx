import { Flex, IconButton, Stack, Text, Button } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useCreateAppFunction, useUpdateAppFunction } from '../hooks/useSaveAppCode';
import { useParams } from 'react-router-dom';
import { useGetApp } from '@/features/app/hooks';
import { useAtom } from 'jotai';
import { fetchersAtom, uiCodeAtom } from '../atoms/tableContextAtoms';

export const AppBuilderNavbar = () => {
	const createAppFunction = useCreateAppFunction();
	const updateAppFunction = useUpdateAppFunction();
	const { appId } = useParams();
	const {
		fetchers: savedFetchers,
		uiComponents,
		refetch,
		isLoading: appDetailsIsLoading,
	} = useGetApp(appId || '');
	const [fetchers] = useAtom(fetchersAtom);
	const [uiCode] = useAtom(uiCodeAtom);
	const handleSaveFunctions = async () => {
		// UI components are currently saved as an array, but for now we only support one UI component
		// Maybe we can just save it as an object instead of an array
		const currentUIComponent = uiComponents?.[0];
		if (currentUIComponent) {
			await updateAppFunction.mutateAsync({
				functionId: currentUIComponent.id || '',
				code: uiCode || '',
				type: 'ui',
			});
		} else {
			await createAppFunction.mutateAsync({
				appId: appId || '',
				code: uiCode || '',
				type: 'ui',
			});
		}

		Object.entries(fetchers).forEach(async (fetcher: any) => {
			const fetcherId = fetcher[0];
			const fetcherCode = fetcher[1];

			const IdInSavedFetchers = savedFetchers?.find((f: any) => f.id === fetcherId);

			if (IdInSavedFetchers) {
				await updateAppFunction.mutateAsync({
					functionId: fetcherId || '',
					code: fetcherCode || '',
					type: 'fetcher',
				});
			} else {
				await createAppFunction.mutateAsync({
					appId: appId || '',
					code: fetcherCode || '',
					type: 'fetcher',
				});
			}
		});
		refetch();
	};

	return (
		<Stack alignItems="center" h="10" borderBottomWidth="1px" direction="row">
			<Flex h="full" alignItems="center">
				<IconButton
					aria-label="Go back to Apps"
					icon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					h="full"
					colorScheme="gray"
					borderRightWidth="1px"
				/>

				<Text fontSize="sm" fontWeight="medium" marginLeft="2">
					App Builder
				</Text>
			</Flex>
			<Button
				size="sm"
				ml="auto"
				mr="1rem"
				onClick={handleSaveFunctions}
				isLoading={
					createAppFunction.isLoading ||
					updateAppFunction.isLoading ||
					appDetailsIsLoading
				}
			>
				Save
			</Button>
		</Stack>
	);
};
