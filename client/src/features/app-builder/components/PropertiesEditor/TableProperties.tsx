import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { Save, Table } from 'react-feather';
import { Stack, Text, IconButton, ButtonGroup, Icon, Badge } from '@chakra-ui/react';
import {
	useDataFetchers,
	useGetTable,
	useUpdateTableProperties,
} from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { InputLoader } from '@/components/Loader';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { DeleteTable } from '@/features/app-builder/components/PropertiesEditor/DeleteTable';
import { pageAtom, useGetPage } from '@/features/page';
import { newPageStateAtom } from '@/features/app-state';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const TableProperties = () => {
	const tableId = useAtomValue(selectedTableIdAtom);
	const { pageId } = useParams();
	const toast = useToast();

	const { isLoading, table, refetch, height: defaultTableHeight } = useGetTable(tableId || '');

	const { pageName, appName } = useAtomValue(pageAtom);

	const { tables } = useGetPage(pageId);

	const pageState = useAtomValue(newPageStateAtom);

	const { fetchers } = useDataFetchers(pageId);

	const mutation = useUpdateTableProperties({
		onSuccess: () => {
			refetch();

			toast({
				title: 'Updated table properties',
				status: 'success',
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to update properties',
				description: getErrorMessage(error),
				status: 'error',
			});
		},
	});

	const methods = useForm();
	const {
		reset,
		formState: { isDirty },
		watch,
		setValue,
	} = methods;

	const selectedFileId = watch('fileId');
	const selectedFile = fetchers.find((f: any) => f.id === selectedFileId);

	useEffect(() => {
		reset(
			{
				name: table?.name,
				fileId: table?.file_id || '',
				height: defaultTableHeight || '',
				depends: table?.depends_on || null,
			},
			{
				keepDirty: false,
				keepDirtyValues: false,
			},
		);
	}, [table, tableId, defaultTableHeight, reset]);

	useEffect(() => {
		if (selectedFile?.type === 'sql') {
			setValue('depends', null);
		}
	}, [selectedFile, setValue]);

	const onSubmit = ({ fileId, height, depends, ...rest }: any) => {
		// const prevSelectedFile = fetchers.find((f: any) => table?.file_id === f.id);
		// const isSwitchingToSQLFromPython =
		// 	prevSelectedFile?.type === 'data_fetcher' && selectedFile?.type === 'sql';

		mutation.mutate({
			tableId,
			appName,
			pageName,
			tableName: rest.name,
			table,
			file: fetchers.find((f: any) => f.id === fileId),
			pageId,
			state: pageState?.state,
			property: { ...(table?.property || {}), height },
			depends,
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
				<Stack key={tableId}>
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
										isUnique: (value: any) => {
											if (value && table?.name !== value) {
												const isUnique = Object.keys(
													pageState?.state?.tables,
												).find(
													(t: any) =>
														t === value && value !== table?.name,
												);
												if (isUnique) {
													return 'Table name must be unique';
												}
											}
											return true;
										},
									},
								}}
							/>

							<FormInput
								type="custom-select"
								id="fileId"
								name="Fetcher"
								placeholder="Select data fetcher"
								options={(fetchers as any).map((file: any) => ({
									name: file.name,
									value: file.id,
									icon: null,
									render: (isSelected: boolean) => {
										return (
											<Stack alignItems="center" direction="row">
												<Icon
													boxSize="6"
													as={Table}
													flexShrink="0"
													color={isSelected ? 'blue.500' : ''}
												/>
												<Stack spacing="0">
													<Text fontWeight="medium">{file.name}</Text>
												</Stack>
												<Badge
													textTransform="lowercase"
													size="xs"
													ml="auto"
													colorScheme={isSelected ? 'blue' : 'gray'}
												>
													.{file.type === 'sql' ? 'sql' : 'py'}
												</Badge>
											</Stack>
										);
									},
								}))}
							/>

							<FormInput
								type="select"
								id="height"
								name="Table height"
								placeholder="Select table height"
								options={['1/3', '1/2', 'full'].map((size: any) => ({
									name: size,
									value: size,
								}))}
							/>

							<FormInput
								type="multiselect"
								id="depends"
								isDisabled={selectedFile?.type === 'sql'}
								name="Depends on"
								placeholder="Select the table which it depends on"
								options={tables
									.filter((t: any) => t.id !== tableId)
									.map((t: any) => ({
										name: t.name,
										value: t.name,
									}))}
							/>
						</Stack>
					</Stack>
				</Stack>
			</FormProvider>
		</form>
	);
};
