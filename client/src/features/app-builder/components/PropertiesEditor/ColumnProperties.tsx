import { useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, Zap } from 'react-feather';

import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import {
	Stack,
	Box,
	Skeleton,
	Tooltip,
	Button,
	Divider,
	SimpleGrid,
	Code,
	useDisclosure,
	Collapse,
	Text,
	IconButton,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInput, InputRenderer } from '@/components/FormInput';
import { useConvertSmartTable, useGetTable, useResourceFields } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { getErrorMessage } from '@/utils';
import { useGetPage, useUpdatePageData } from '@/features/page';

const ColumnProperty = ({
	tableType,
	edit_keys,
	configurations: defaultConfigurations,
	display_type: defaultDisplayType,
	...properties
}: any) => {
	const toast = useToast();
	const tableName = useAtomValue(selectedTableIdAtom);
	const { appName, pageName } = useParams();

	const methods = useForm();
	const { watch, setValue } = methods;

	const { properties: pageProperties } = useGetPage({ appName, pageName });

	const { isOpen, onToggle } = useDisclosure();

	const { fields: resourceFields } = useResourceFields();
	const columnFields = resourceFields[tableType === 'sql' ? 'pgcolumn' : 'pycolumn'] || [];

	// const allFieldsName = columnFields.map((field: any) => field.name);

	const displayType = watch('display_type');
	const configurations = watch('configurations');

	const allDisplayConfigurations = resourceFields.display_type_configurations;
	const displayConfiguration =
		allDisplayConfigurations?.find((d: any) => d.name === displayType) || [];
	const configProperties = displayConfiguration?.properties || {};

	useEffect(() => {
		setValue('configurations', defaultConfigurations, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue('display_type', defaultDisplayType, {
			shouldTouch: false,
			shouldDirty: false,
		});
	}, [defaultDisplayType, defaultConfigurations, setValue]);

	const updateMutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated column properties',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update properties',
				description: getErrorMessage(error),
			});
		},
	});

	const handleUpdate = (partialValues: any) => {
		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(pageProperties || {}),
				tables: (pageProperties?.tables || []).map((t: any) => {
					if (t.name === tableName) {
						return {
							...t,
							columns: (t?.columns || []).map((c: any) => {
								if (c.name === properties.name) {
									return {
										...c,
										...properties,
										...partialValues,
									};
								}

								return c;
							}),
						};
					}

					return t;
				}),
			},
		});
	};

	const resetConfig = () => {
		setValue('configurations', null);
	};

	const onSubmit = (formValues: any) => {
		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(pageProperties || {}),
				tables: (pageProperties?.tables || []).map((t: any) => {
					if (t.name === tableName) {
						return {
							...t,
							columns: (t?.columns || []).map((c: any) => {
								if (c.name === properties.name) {
									return {
										...c,
										...properties,
										...formValues,
									};
								}

								return c;
							}),
						};
					}

					return t;
				}),
			},
		});
	};

	const hasNoEditKeys = edit_keys?.length === 0;

	return (
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			<FormProvider {...methods}>
				<Stack spacing="0" borderBottomWidth="1px">
					<SimpleGrid
						p="2"
						borderBottomWidth={isOpen ? '1px' : '0'}
						alignItems="center"
						gap={3}
						bg={isOpen ? 'gray.50' : ''}
						columns={3}
					>
						<Box alignSelf="center" overflow="hidden">
							<Tooltip placement="left-end" label={properties.name}>
								<Code
									h="full"
									as={Text}
									isTruncated
									bg="transparent"
									whiteSpace="nowrap"
									display="inline"
									w="full"
									overflow="hidden"
									lineHeight={1}
									textOverflow="ellipsis"
								>
									{properties.name}
								</Code>
							</Tooltip>
						</Box>
						<Tooltip label={hasNoEditKeys ? 'Not editable' : ''}>
							<Box>
								<InputRenderer
									type="boolean"
									isDisabled={
										tableType !== 'sql' ||
										hasNoEditKeys ||
										updateMutation.isLoading
									}
									id="editable"
									value={properties.editable}
									onChange={(newValue: any) => {
										handleUpdate({
											editable: newValue,
										});
									}}
								/>
							</Box>
						</Tooltip>
						<Stack alignItems="center" justifyContent="space-between" direction="row">
							<InputRenderer
								type="boolean"
								id="hidden"
								isDisabled={updateMutation.isLoading}
								value={properties.hidden}
								onChange={(newValue: any) => {
									handleUpdate({
										hidden: newValue,
									});
								}}
							/>

							<Stack direction="row" alignItems="center">
								{JSON.stringify(configurations) !==
									JSON.stringify(defaultConfigurations) ||
								JSON.stringify(defaultDisplayType) !==
									JSON.stringify(displayType) ? (
									<IconButton
										aria-label="Update column"
										type="submit"
										isLoading={updateMutation.isLoading}
										size="xs"
										icon={<Save size="14" />}
									/>
								) : null}
								<Box
									as="button"
									border="0"
									cursor="pointer"
									p="1"
									type="button"
									onClick={onToggle}
									borderRadius="sm"
									_hover={{ bg: 'gray.100' }}
								>
									{isOpen ? (
										<ChevronDown size="14" />
									) : (
										<ChevronRight size="14" />
									)}
								</Box>
							</Stack>
						</Stack>
					</SimpleGrid>
					<Collapse in={isOpen}>
						<Stack p="3">
							{columnFields.map((field: any) => {
								if (field.name === 'display_type') {
									return (
										<>
											<FormInput
												type="custom-select"
												id={field.name}
												name={field.title}
												w="50%"
												options={field.enum.map((option: any) => ({
													name: option,
													value: option,
												}))}
												onSelect={resetConfig}
											/>

											<SimpleGrid gap={4} columns={2}>
												{Object.keys(configProperties).map((key: any) => {
													const property = configProperties?.[key];
													const isRequired =
														displayConfiguration?.required?.includes(
															key,
														);
													return (
														<Box
															gridColumn={
																property.type === 'array'
																	? '1 / -1'
																	: ''
															}
														>
															<FormInput
																key={key}
																type={property?.type}
																id={`configurations.${key}`}
																name={key}
																keys={
																	key === 'options'
																		? ['value']
																		: null
																}
																required={isRequired}
																validation={
																	isRequired
																		? {
																				required: `${key} is required`,
																		  }
																		: {}
																}
															/>
														</Box>
													);
												})}
											</SimpleGrid>
										</>
									);
								}

								return null;
							})}
						</Stack>
					</Collapse>
				</Stack>
			</FormProvider>
		</form>
	);
};

export const ColumnsProperties = () => {
	const toast = useToast();

	const { appName, pageName } = useParams();

	const tableId = useAtomValue(selectedTableIdAtom);
	const pageState = useAtomValue(newPageStateAtom);

	const { type, columns, isLoading, table } = useGetTable(tableId || '');

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to convert table',
				description: getErrorMessage(error),
			});
		},
	});

	const handleConvert = () => {
		convertMutation.mutate({
			table,
			state: pageState.state,
			appName,
			pageName,
		});
	};

	if (isLoading) {
		return (
			<Stack p="3">
				<Skeleton
					startColor="gray.100"
					endColor="gray.200"
					w="36"
					h="10"
					borderRadius="sm"
				/>
				<Stack p="3" bg="white">
					<Stack borderWidth="1px" spacing="0" divider={<Divider />}>
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack spacing="3" h="full" overflowY="auto">
			<Text fontSize="md" pt="3" px="3" fontWeight="semibold">
				Columns
			</Text>
			{type === 'sql' && !table?.smart ? (
				<Button
					leftIcon={<Zap size="14" />}
					size="sm"
					colorScheme="yellow"
					onClick={handleConvert}
					isLoading={convertMutation.isLoading}
					mr="auto"
					ml="2"
					variant="ghost"
				>
					Convert to Smart Table
				</Button>
			) : null}
			<Stack spacing="0" borderTopWidth="1px">
				{columns.map((column: any) => (
					<ColumnProperty tableType={type} key={column.name} {...column} />
				))}
			</Stack>
		</Stack>
	);
};
