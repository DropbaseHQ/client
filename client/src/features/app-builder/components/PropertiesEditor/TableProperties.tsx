import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue, useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { Save } from 'react-feather';
import { Stack, Text, IconButton, ButtonGroup, StackDivider } from '@chakra-ui/react';
import { useGetTable, useResourceFields } from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { InputLoader } from '@/components/Loader';
import { inspectedResourceAtom, selectedTableIdAtom } from '@/features/app-builder/atoms';
import { DeleteTable } from '@/features/app-builder/components/PropertiesEditor/DeleteTable';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { NameEditor } from '@/features/app-builder/components/NameEditor';
import { LabelContainer } from '@/components/LabelContainer';
import { SelectDataFetcher } from '../SelectDataFetcher';

export const TableProperties = () => {
	const tableId = useAtomValue(selectedTableIdAtom);
	const { appName, pageName } = useParams();
	const toast = useToast();

	const setInspectedResource = useSetAtom(inspectedResourceAtom);

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

	const currentCategories = ['Default'];

	const { tables, files, properties, widgets } = useGetPage({ appName, pageName });

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

	const functions = files.filter((f: any) => f.type === 'python')?.map((f: any) => f?.name);

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
				blocks: [
					...(properties?.blocks || []).map((t: any) => {
						if (t.name === tableId) {
							return {
								...t,
								...rest,
								fetcher,
								depends_on: depends,
								height,
								type:
									files?.find((f: any) => f.name === fetcher)?.type === 'sql'
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

	const handleUpdateName = async (newName: any) => {
		try {
			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: [
						...(properties?.blocks || []).map((t: any) => {
							if (t.name === tableId) {
								return {
									...t,
									name: newName,
								};
							}

							return t;
						}),
					],
				},
			});

			setInspectedResource({
				id: newName,
				type: 'table',
				meta: null,
			});
		} catch (e) {
			//
		}
	};

	const resetDependsOn = (newFileId: any) => {
		const newFile = files.find((f: any) => f.name === newFileId);

		if (newFile?.type === 'python') {
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
						py="1.5"
						px="4"
						borderBottomWidth="1px"
						flex="1"
						alignItems="center"
						direction="row"
					>
						<Stack direction="row" alignItems="center">
							<LabelContainer>
								<LabelContainer.Code>{tableId}</LabelContainer.Code>
							</LabelContainer>
							<NameEditor
								value={tableId}
								currentNames={(properties?.tables || []).map((t: any) => t.name)}
								onUpdate={handleUpdateName}
								resource="table"
							/>
						</Stack>
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
												return null;
											}

											if (property.name === 'fetcher') {
												return (
													<SelectDataFetcher
														id={property.name}
														name={property.title}
														onSelect={resetDependsOn}
														fetchers={files}
													/>
												);
											}

											if (property.name === 'widget') {
												return (
													<FormInput
														{...property}
														id={property.name}
														name={property.title}
														type="select"
														options={widgets
															?.filter(
																(w: any) => w.type === 'inline',
															)
															?.map((w: any) => ({
																name: w.label,
																value: w.name,
															}))}
														key={property.name}
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

											if (property.name === 'size') {
												return (
													<FormInput
														type="select"
														id="size"
														name={property.title}
														placeholder="Select table size"
														options={[1, 10, 20, 50, 100].map(
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
