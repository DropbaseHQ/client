import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { Save } from 'react-feather';
import { Stack, Box, Text, IconButton, ButtonGroup } from '@chakra-ui/react';
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
import { useToast } from '@/lib/chakra-ui';

export const TableProperties = () => {
	const tableId = useAtomValue(selectedTableIdAtom);
	const { pageId } = useParams();
	const toast = useToast();

	const { isLoading, table, refetch } = useGetTable(tableId || '');

	const { pageName, appName } = useAtomValue(pageAtom);

	const pageState = useAtomValue(newPageStateAtom);

	const { fetchers } = useDataFetchers(pageId);

	const [errorLog, setErrorLog] = useState('');

	const mutation = useUpdateTableProperties({
		onSuccess: () => {
			refetch();
			setErrorLog('');

			toast({
				title: 'Updated table properties',
				status: 'success',
			});
		},
		onError: (error: any) => {
			setErrorLog(
				error?.response?.data?.error || error?.response?.data || error?.message || '',
			);
		},
	});

	const methods = useForm();
	const {
		reset,
		formState: { isDirty },
	} = methods;

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
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			<FormProvider {...methods}>
				<Stack>
					<Stack
						py="2"
						px="4"
						borderBottomWidth="1px"
						flex="1"
						alignItems="center"
						direction="row"
					>
						<Text fontWeight="semibold" size="sm">
							Table Properties
						</Text>
						<ButtonGroup ml="auto" size="xs">
							{isDirty ? (
								<IconButton
									aria-label="Update component"
									isLoading={mutation.isLoading}
									type="submit"
									icon={<Save size="14" />}
								/>
							) : null}
							<DeleteTable tableId={tableId} tableName={table?.name} />
						</ButtonGroup>
					</Stack>
					<Stack px="4" py="2" h="full" overflowY="auto">
						<Stack spacing="4">
							<FormInput
								id="name"
								name="Table Name"
								type="text"
								validation={{
									validate: {
										noUpperCase: (value: any) => {
											if (value && value !== value.toLowerCase()) {
												return 'Must be lowercase';
											}
											return true;
										},
										noSpecialChars: (value: any) => {
											if (value && /[^a-z0-9]/.test(value)) {
												return 'Must not contain special characters';
											}
											return true;
										},
									},
								}}
							/>

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
									borderRadius="sm"
									as="pre"
									fontFamily="mono"
								>
									{errorLog}
								</Box>
							) : null}
						</Stack>
					</Stack>
				</Stack>
			</FormProvider>
		</form>
	);
};
