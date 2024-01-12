import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { Save, Table } from 'react-feather';
import { Stack, Text, IconButton, ButtonGroup, Icon, Badge, StackDivider } from '@chakra-ui/react';
import { useGetTable, useResourceFields } from '@/features/app-builder/hooks';
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
		table,
	} = useGetTable(tableId || '');

	const { fields } = useResourceFields();

	const currentCategories = ['Default', 'Events'];

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

	const functions = files.filter((f: any) => f.type === 'ui')?.map((f: any) => f?.name);

	const selectedFetcher = watch('fetcher');
	const selectedFile = files.find((f: any) => f.name === selectedFetcher);

	useEffect(() => {
		reset(
			{
				...table,
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
	}, [
		defaultDependsOn,
		defaultFetcher,
		defaultTableName,
		defaultTableLabel,
		defaultTableHeight,
		table,
		reset,
	]);

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
					{/* FIXME: create a categorized section component */}
					<Stack spacing="0" h="full" overflowY="auto" divider={<StackDivider />}>
						{currentCategories.map((category: any) => (
							<Stack spacing="3" p="3">
								{category.toLowerCase() === 'default' ? null : (
									<Text fontSize="md" fontWeight="semibold">
										{category}
									</Text>
								)}
								<Stack spacing="3">
									{fields?.table
										?.filter((property: any) => property.category === category)
										.map((property: any) => {
											if (
												property.name === 'filters' ||
												property.name === 'type'
											) {
												return null;
											}

											if (property.name === 'name') {
												return (
													<FormInput
														id="name"
														name={property.title}
														type="text"
														validation={{
															validate: {
																noUpperCase: (value: any) => {
																	if (
																		value &&
																		value !==
																			value.toLowerCase()
																	) {
																		return 'Must be lowercase';
																	}
																	return true;
																},
																noSpecialChars: (value: any) => {
																	if (
																		value &&
																		/[^a-z0-9_]/.test(value)
																	) {
																		return 'Must not contain special characters other than underscores';
																	}
																	return true;
																},
																isUnique: (value: any) => {
																	if (
																		value &&
																		defaultTableName !== value
																	) {
																		const isUnique =
																			Object.keys(
																				pageState?.state
																					?.tables,
																			).find(
																				(t: any) =>
																					t === value &&
																					value !==
																						defaultTableName,
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
												);
											}

											if (property.name === 'fetcher') {
												return (
													<FormInput
														type="custom-select"
														id="fetcher"
														name={property.title}
														placeholder="Select data fetcher"
														onSelect={resetDependsOn}
														options={(fetchers as any).map(
															(file: any) => ({
																name: file.name,
																value: file.name,
																icon: null,
																render: (isSelected: boolean) => {
																	return (
																		<Stack
																			alignItems="center"
																			direction="row"
																		>
																			<Icon
																				boxSize="6"
																				as={Table}
																				flexShrink="0"
																				color={
																					isSelected
																						? 'blue.500'
																						: ''
																				}
																			/>
																			<Stack spacing="0">
																				<Text fontWeight="medium">
																					{file.name}
																				</Text>
																			</Stack>
																			<Badge
																				textTransform="lowercase"
																				size="xs"
																				ml="auto"
																				colorScheme={
																					isSelected
																						? 'blue'
																						: 'gray'
																				}
																			>
																				.
																				{file.type === 'sql'
																					? 'sql'
																					: 'py'}
																			</Badge>
																		</Stack>
																	);
																},
															}),
														)}
													/>
												);
											}

											if (property.name === 'height') {
												return (
													<FormInput
														type="select"
														id="height"
														name={property.title}
														placeholder="Select table height"
														options={['1/3', '1/2', 'full'].map(
															(size: any) => ({
																name: size,
																value: size,
															}),
														)}
													/>
												);
											}

											if (property.name === 'depends_on') {
												return (
													<FormInput
														type="multiselect"
														id="depends"
														isDisabled={selectedFile?.type === 'sql'}
														name={property.title}
														placeholder="Select the table which it depends on"
														options={tables
															.filter((t: any) => t.name !== tableId)
															.map((t: any) => ({
																name: t.name,
																value: t.name,
															}))}
													/>
												);
											}

											const showFunctionList =
												property.type === 'on_row_change' ||
												property.name === 'on_row_select';

											return (
												<FormInput
													{...property}
													id={property.name}
													name={property.title}
													type={
														showFunctionList ? 'select' : property.type
													}
													options={(
														(showFunctionList
															? functions
															: property.enum || property.options) ||
														[]
													).map((o: any) => ({
														name: o,
														value: o,
													}))}
													key={property.name}
												/>
											);
										})}
								</Stack>
							</Stack>
						))}
					</Stack>
				</Stack>
			</FormProvider>
		</form>
	);
};
