import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { Stack, Box, Button } from '@chakra-ui/react';
import {
	useDataFetchers,
	useGetTable,
	useUpdateTableProperties,
} from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { InputLoader } from '@/components/Loader';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { DeleteTable } from '@/features/app-builder/components/PropertiesEditor/DeleteTable';
import { pageAtom } from '@/features/page';
import { newPageStateAtom } from '@/features/app-state';

export const TableProperties = () => {
	const tableId = useAtomValue(selectedTableIdAtom);
	const { pageId } = useParams();

	const { isLoading, table, refetch } = useGetTable(tableId || '');

	const { pageName, appName } = useAtomValue(pageAtom);

	const pageState = useAtomValue(newPageStateAtom);

	const { fetchers } = useDataFetchers(pageId);

	const [errorLog, setErrorLog] = useState('');

	const mutation = useUpdateTableProperties({
		onSuccess: () => {
			refetch();
			setErrorLog('');
		},
		onError: (error: any) => {
			setErrorLog(error?.response?.data?.error || '');
		},
	});

	const methods = useForm();
	const { reset } = methods;

	useEffect(() => {
		reset(
			{ name: table?.name, fileId: table?.file_id || '' },
			{
				keepDirty: false,
				keepDirtyValues: false,
			},
		);
	}, [table, tableId, reset]);

	useEffect(() => {
		setErrorLog('');
	}, [tableId]);

	const onSubmit = ({ fileId, ...rest }: any) => {
		mutation.mutate({
			tableId,
			appName,
			pageName,
			tableName: rest.name,
			table,
			file: fetchers.find((f: any) => f.id === fileId),
			pageId,
			state: pageState?.state,
		});
	};

	if (isLoading) {
		return (
			<Stack p="6" borderRadius="sm" spacing="3" borderWidth="1px" bg="white">
				<InputLoader isLoading />
				<InputLoader isLoading />
				<InputLoader isLoading />
			</Stack>
		);
	}

	return (
		<Stack px="3" h="full" overflowY="auto" bg="white">
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack spacing="4">
						<FormInput id="name" name="Table Name" type="text" />

						<FormInput
							type="select"
							id="fileId"
							name="Fetcher"
							placeholder="Select data fetcher"
							validation={{ required: 'option is required' }}
							options={(fetchers as any).map((file: any) => ({
								name: file.name,
								value: file.id,
							}))}
						/>

						{errorLog ? (
							<Box
								fontSize="xs"
								color="red.500"
								bg="white"
								p="2"
								borderRadius="sm"
								as="pre"
								fontFamily="mono"
							>
								{errorLog}
							</Box>
						) : null}

						<Stack direction="row" justifyContent="space-between">
							<Button
								size="sm"
								w="max-content"
								variant="outline"
								flexGrow="0"
								isLoading={mutation.isLoading}
								type="submit"
							>
								Update
							</Button>

							<DeleteTable tableId={tableId} tableName={table?.name} />
						</Stack>
					</Stack>
				</FormProvider>
			</form>
		</Stack>
	);
};
