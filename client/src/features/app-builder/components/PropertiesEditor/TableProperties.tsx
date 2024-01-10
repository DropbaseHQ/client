import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { Save, Table } from 'react-feather';
import { Stack, Text, IconButton, ButtonGroup, Icon, Badge } from '@chakra-ui/react';
import { useGetTable } from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { InputLoader } from '@/components/Loader';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { DeleteTable } from '@/features/app-builder/components/PropertiesEditor/DeleteTable';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { newPageStateAtom } from '@/features/app-state';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const TableProperties = () => {
	const tableId = useAtomValue(selectedTableIdAtom);
	const { appName, pageName } = useParams();
	const toast = useToast();

	const {
		isLoading,
		depends_on: defaultDependsOn,
		name: defaultTableName,
		fetcher: defaultFetcher,
		height: defaultTableHeight,
		label: defaultTableLabel,
	} = useGetTable(tableId || '');

	const { tables, files, properties } = useGetPage({ appName, pageName });

	const pageState = useAtomValue(newPageStateAtom);

	const mutation = useUpdatePageData({
		onSuccess: () => {
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

	const fetchers = files.filter((f: any) => f.type === 'sql' || f.type === 'data_fetcher');

	const selectedFetcher = watch('fetcher');
	const selectedFile = files.find((f: any) => f.name === selectedFetcher);

	useEffect(() => {
		reset(
			{
				name: defaultTableName,
				label: defaultTableLabel,
				fetcher: defaultFetcher || '',
				height: defaultTableHeight || '',
				depends: defaultDependsOn || null,
			},
			{
				keepDirty: false,
				keepDirtyValues: false,
			},
		);
	}, [defaultDependsOn, defaultFetcher, defaultTableName, defaultTableHeight, reset]);

	const onSubmit = ({ fetcher, height, depends, ...rest }: any) => {
		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				tables: [
					...(properties?.tables || []).map((t: any) => {
						if (t.name === tableId) {
							return {
								...t,
								...rest,
								fetcher,
								depends_on: depends,
								height,
								type:
									fetchers?.find((f: any) => f.name === fetcher)?.type === 'sql'
										? 'sql'
										: 'python',
							};
						}

						return t;
					}),
				],
			},
		});
	};

	const resetDependsOn = (newFileId: any) => {
		const newFile = files.find((f: any) => f.name === newFileId);

		if (newFile?.type === 'data_fetcher') {
			setValue('depends', null);
		}
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
							<DeleteTable tableId={tableId} tableName={defaultTableName} />
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
											if (value && /[^a-z0-9_]/.test(value)) {
												return 'Must not contain special characters other than underscores';
											}
											return true;
										},
										isUnique: (value: any) => {
											if (value && defaultTableName !== value) {
												const isUnique = Object.keys(
													pageState?.state?.tables,
												).find(
													(t: any) =>
														t === value && value !== defaultTableName,
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

							<FormInput id="label" name="Table Label" type="text" />

							<FormInput
								type="custom-select"
								id="fetcher"
								name="Fetcher"
								placeholder="Select data fetcher"
								onSelect={resetDependsOn}
								options={(fetchers as any).map((file: any) => ({
									name: file.name,
									value: file.name,
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
									.filter((t: any) => t.name !== tableId)
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
