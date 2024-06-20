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

import { LabelContainer } from '@/components/LabelContainer';
import { NameEditor } from '@/features/app-builder/components/NameEditor';

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

	const { files, properties} = useGetPage({ appName, pageName });

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
	} = methods;


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
		const currentTable = properties[tableId] || {};

		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				[tableId]: {
					...currentTable,
					...rest,
					fetcher,
					depends_on: depends,
					height,
					type:
						files?.find((f: any) => f.name === fetcher?.value)?.type === 'sql'
							? 'sql'
							: 'python',
				},
			},
		});
	};

	const handleUpdateName = async (newName: any) => {
		const currentTable = properties[tableId] || {};

		try {
			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					[tableId]: {
						...currentTable,
						name: newName,
					},
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
						<Stack direction="row" alignItems="center">
							<LabelContainer>
								<LabelContainer.Code>{tableId}</LabelContainer.Code>
							</LabelContainer>

							{false ? (
								<NameEditor
									value={tableId}
									currentNames={(properties?.tables || []).map(
										(t: any) => t.name,
									)}
									onUpdate={handleUpdateName}
									resource="table"
								/>
							) : null}
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
							<Stack key={category} spacing="3" p="3">
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
												property.name === 'type' ||
												property.name === 'header' ||
												property.name === 'footer' ||
												property.name === 'name' ||
												property.name === 'columns'
											) {
												return null;
											}


											return (
												<FormInput
													{...property}
													id={property.name}
													name={property.title}
													type={property.type}
													key={property.name}
													options={(
														(property.enum || property.options) ||
														[]
													).map((o: any) => ({
														name: o,
														value: o,
													}))}
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
