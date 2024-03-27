import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, Trash, Zap } from 'react-feather';

import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import {
	Stack,
	Box,
	Skeleton,
	Tooltip,
	Button,
	Center,
	Menu,
	MenuButton,
	MenuItemOption,
	MenuList,
	Divider,
	SimpleGrid,
	Code,
	useDisclosure,
	Collapse,
	Text,
	Portal,
	IconButton,
	FormLabel,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInput, InputRenderer } from '@/components/FormInput';
import { useConvertSmartTable, useGetTable, useResourceFields } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { getErrorMessage } from '@/utils';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { NewColumn } from '@/features/app-builder/components/PropertiesEditor/NewColumn';
import { EventPropertyEditor } from '@/features/app-builder/components/PropertiesEditor/EventPropertyEditor';

const DISPLAY_TYPE_ENUM: any = {
	text: ['text', 'select'],
	integer: ['integer', 'currency'],
	float: ['float', 'currency'],
	currency: ['integer', 'float', 'currency'],
	select: ['text', 'select'],
};

const VISIBLE_FIELDS_SCHEMA = [
	'table_name',
	'primary_key',
	'foreign_key',
	'default',
	'column_type',
	'nullable',
	'unique',
];

const VISIBLE_EDITABLE_FIELDS: any = {
	pgcolumn: ['display_type'],
	snowflakecolumn: ['display_type'],
	mysqlcolumn: ['display_type'],
	sqlitecolumn: ['display_type'],
	button_column: ['on_click', 'label', 'name', 'display_type', 'color'],
	pycolumn: ['display_type'],
};

const resolveDisplayTypeOptions = (displayType: any) => {
	if (DISPLAY_TYPE_ENUM[displayType]) {
		return DISPLAY_TYPE_ENUM[displayType];
	}

	return [displayType];
};

const ColumnProperty = ({
	tableType,
	edit_keys,
	configurations: defaultConfigurations,
	display_type: defaultDisplayType,

	on_click: defaultOnClick,
	label: defaultLabel,
	name: defaultName,
	color: defaultColor,

	...properties
}: any) => {
	const toast = useToast();
	const tableName = useAtomValue(selectedTableIdAtom);
	const { appName, pageName } = useParams();

	const methods = useForm();
	const {
		watch,
		setValue,
		formState: { isDirty },
		reset,
	} = methods;

	const { properties: pageProperties } = useGetPage({ appName, pageName });

	const tableId = useAtomValue(selectedTableIdAtom);

	const { columns } = useGetTable(tableId || '');

	const { isOpen, onToggle } = useDisclosure();
	const { isOpen: isConfigurationOpen, onToggle: onToggleConfigurations } = useDisclosure();

	const { fields: resourceFields } = useResourceFields();
	let columnField = '';

	if (properties?.column_type === 'button_column') {
		columnField = 'button_column';
	} else if (properties?.column_type === 'postgres') {
		columnField = 'pgcolumn';
	} else if (properties?.column_type === 'snowflake') {
		columnField = 'snowflakecolumn';
	} else if (properties?.column_type === 'mysql') {
		columnField = 'mysqlcolumn';
	} else if (properties?.column_type === 'sqlite') {
		columnField = 'sqlitecolumn';
	}

	const columnFields = resourceFields?.[columnField] || [];

	// const allFieldsName = columnFields.map((field: any) => field.name);

	const displayType = watch('display_type');

	const [selectedOptionLabel, setSelectedOptionLabel] = useState('');
	const [optionsList, setOptionsList] = useState([]);

	const allDisplayConfigurations = resourceFields?.display_type_configurations || [];
	const displayConfiguration =
		allDisplayConfigurations?.find((d: any) => d.name === displayType) || {};

	const configProperties = displayConfiguration?.properties || {};

	const editableFields = VISIBLE_EDITABLE_FIELDS?.[columnField];

	const isCustomColumn = columnField === 'button_column';

	// FIXME: check why useEffect loop with properties
	useEffect(() => {
		setValue('configurations', defaultConfigurations, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue('display_type', defaultDisplayType, {
			shouldTouch: false,
			shouldDirty: false,
		});
		setValue('color', defaultColor, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue('on_click', defaultOnClick, {
			shouldTouch: false,
			shouldDirty: false,
		});
		setValue('label', defaultLabel, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue('name', defaultName, {
			shouldTouch: false,
			shouldDirty: false,
		});
	}, [
		defaultDisplayType,
		defaultConfigurations,
		defaultOnClick,
		defaultLabel,
		defaultName,
		defaultColor,
		setValue,
	]);

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

	const handleUpdate = async (partialValues: any) => {
		try {
			const newProperties = {
				...(pageProperties || {}),
				tables: (pageProperties?.tables || []).map((t: any) => {
					if (t.name === tableName) {
						return {
							...t,
							columns: (t?.columns || []).map((c: any) => {
								if (c.name === defaultName) {
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
			};
			await updateMutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: newProperties,
			});

			const currentColumn =
				(pageProperties?.tables || [])
					.find((t: any) => t.name === tableName)
					?.columns?.find((c: any) => c.name === defaultName) || {};

			reset(currentColumn, {
				keepDirty: false,
				keepDirtyValues: false,
			});
		} catch (e) {
			//
		}
	};

	const handleDelete = async (columnId: any) => {
		try {
			await updateMutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(pageProperties || {}),
					tables: (pageProperties?.tables || []).map((t: any) => {
						if (t.name === tableName) {
							return {
								...t,
								columns: (t?.columns || []).filter((c: any) => {
									return c.name !== columnId;
								}),
							};
						}

						return t;
					}),
				},
			});
		} catch (e) {
			//
		}
	};

	const onSubmit = (formValues: any) => {
		handleUpdate(formValues);
	};

	const hasNoEditKeys = edit_keys?.length === 0;

	let allVisibleFields;
	if (properties?.column_type === 'postgres' || properties?.column_type === 'snowflake') {
		allVisibleFields =
			columnFields.filter((f: any) =>
				['schema_name', ...VISIBLE_FIELDS_SCHEMA].includes(f.name),
			) || [];
	} else {
		allVisibleFields =
			columnFields.filter((f: any) => VISIBLE_FIELDS_SCHEMA.includes(f.name)) || [];
	}

	useEffect(() => {
		setOptionsList(resolveDisplayTypeOptions(displayType));
	}, [displayType]);

	const handleSelectChange = (selectedValue: any) => {
		setValue('configurations', null, { shouldDirty: true });

		if (selectedValue === 'integer') {
			setValue(`configurations.${selectedValue}.config_type`, 'int', { shouldDirty: true });
		} else if (selectedValue === 'text') {
			setValue(`configurations.${selectedValue}.config_type`, 'text', { shouldDirty: true });
		}

		setSelectedOptionLabel(selectedValue);
	};

	return (
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			<FormProvider {...methods}>
				<Stack
					spacing="0"
					borderBottomWidth={isOpen ? '1px' : '0'}
					borderTopWidth={isOpen ? '1px' : '0'}
				>
					<Stack
						py="2"
						px="3"
						direction="row"
						alignItems="center"
						_hover={{ bg: 'gray.50' }}
						cursor="pointer"
						gap={3}
						onClick={onToggle}
					>
						<Box alignSelf="center" overflow="hidden" width="50%">
							<Tooltip placement="left-end" label={defaultName}>
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
									{defaultName}
								</Code>
							</Tooltip>
						</Box>
						{isCustomColumn ? (
							<Box width="20%" />
						) : (
							<Tooltip label={hasNoEditKeys ? 'Not editable' : ''}>
								<Stack direction="row" width="20%">
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
								</Stack>
							</Tooltip>
						)}
						<Stack align="center" justify="space-between" direction="row" width="20%">
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
						</Stack>
						<Stack>
							<Box
								as="button"
								border="0"
								cursor="pointer"
								p="1"
								type="button"
								borderRadius="sm"
							>
								{isOpen ? <ChevronDown size="14" /> : <ChevronRight size="14" />}
							</Box>
						</Stack>
					</Stack>

					<Collapse in={isOpen}>
						<Stack p="3">
							<Menu>
								<Stack spacing="0.5">
									<MenuButton
										as={Stack}
										direction="row"
										alignItems="center"
										borderWidth="1px"
										p="1.5"
										borderRadius="sm"
										type="button"
										width="50%"
										// cursor={inputProps?.isDisabled ? 'not-allowed' : 'pointer'}
									>
										<Stack
											w="full"
											spacing="0"
											alignItems="center"
											direction="row"
										>
											<Box>
												<Text fontSize="sm">
													{selectedOptionLabel ||
														displayType ||
														'Select option'}
												</Text>
											</Box>
											<Box ml="auto">
												<ChevronDown size="14" />
											</Box>
										</Stack>
									</MenuButton>
								</Stack>
								<Portal>
									<MenuList
										zIndex="popover"
										// pointerEvents={inputProps?.isDisabled ? 'none' : 'initial'}
										borderRadius="sm"
										shadow="sm"
										p="0"
										maxH="sm"
										overflowY="auto"
									>
										{optionsList.length === 0 ? (
											<Center>
												<Text fontSize="sm">No options present</Text>
											</Center>
										) : (
											optionsList.map((option, index) => (
												<MenuItemOption
													fontSize="sm"
													key={option}
													value={option}
													data-cy={`select-option-${index}`}
													onClick={() => {
														handleSelectChange(option);
													}}
												>
													{option}
												</MenuItemOption>
											))
										)}
									</MenuList>
								</Portal>
							</Menu>
							{columnFields
								.filter((f: any) => editableFields?.includes(f?.name))
								.map((f: any) => {
									if (f?.category === 'Events') {
										return <EventPropertyEditor id={f.name} />;
									}

									if (f.name === 'name') {
										return (
											<FormInput
												{...f}
												id={f.name}
												name={f.title}
												validation={{
													required: 'Cannot  be empty',
													validate: {
														unique: (value: any) => {
															if (
																columns
																	.filter(
																		(c: any) =>
																			c.name !== defaultName,
																	)
																	.find(
																		(c: any) =>
																			c.name === value,
																	)
															) {
																return 'Name must be unique';
															}

															return true;
														},
													},
												}}
											/>
										);
									}

									if (f.name === 'display_type') {
										return null;
									}

									return (
										<FormInput
											id={f.name}
											name={f.title}
											options={(f.enum || f.options || []).map((o: any) => ({
												name: o,
												value: o,
											}))}
											key={f.name}
										/>
									);
								})}

							{Object.keys(configProperties).length > 0 &&
							configProperties[selectedOptionLabel] ? (
								<SimpleGrid gap={4} columns={2}>
									{Object.entries(
										configProperties[selectedOptionLabel].properties as Record<
											string,
											any
										>,
									)
										.filter(([, value]) => value.category !== 'Internal')
										.map(([key, property]) => {
											const isRequired =
												displayConfiguration?.required?.includes(key);
											return (
												<Box
													key={key}
													gridColumn={
														property.type === 'array' ? '1 / -1' : ''
													}
													py="2"
												>
													<FormInput
														key={key}
														type={property.type}
														id={`configurations.${selectedOptionLabel}.${key}`} // this is the important one
														name={property.title}
														keys={
															key === 'options'
																? ['name', 'value']
																: null
														}
														options={(
															property.enum ||
															property.options ||
															[]
														).map((o: any) => ({
															name: o,
															value: o,
														}))}
														required={isRequired}
														validation={
															isRequired
																? { required: `${key} is required` }
																: {}
														}
													/>
												</Box>
											);
										})}
								</SimpleGrid>
							) : null}

							<Stack direction="row" alignItems="center">
								{allVisibleFields.length > 0 ? (
									<Button
										variant="link"
										color="gray.500"
										size="xs"
										w="fit-content"
										fontWeight="normal"
										onClick={onToggleConfigurations}
									>
										{isConfigurationOpen ? 'Hide' : 'Show'} metadata
									</Button>
								) : null}

								<Stack ml="auto" direction="row" alignItems="center">
									{isDirty ? (
										<IconButton
											aria-label="Update column"
											type="submit"
											isLoading={updateMutation.isLoading}
											size="xs"
											icon={<Save size="14" />}
										/>
									) : null}

									{isCustomColumn ? (
										<Tooltip label="Delete Column">
											<IconButton
												aria-label="Delete component"
												variant="outline"
												size="xs"
												ml="auto"
												colorScheme="red"
												isLoading={updateMutation.isLoading}
												onClick={() => {
													handleDelete(defaultName);
												}}
												icon={<Trash size="14" />}
											/>
										</Tooltip>
									) : null}
								</Stack>
							</Stack>

							<Collapse in={isConfigurationOpen}>
								<SimpleGrid mt="2" alignItems="center" gap={2}>
									{allVisibleFields.map((property: any) => (
										<Stack spacing="0.5" key={property.name} direction="row">
											<FormLabel width="50%">{property.name}</FormLabel>
											<Code background="transparent" fontSize="sm">
												{property.type === 'boolean'
													? JSON.stringify(properties[property.name])
													: properties[property.name] || '-'}
											</Code>
										</Stack>
									))}
								</SimpleGrid>
							</Collapse>
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
		table: tableId,
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
				<Skeleton w="36" h="10" borderRadius="sm" />
				<Stack p="3" bg="white">
					<Stack spacing="0" divider={<Divider />}>
						<Skeleton h="10" />
						<Skeleton h="10" />
						<Skeleton h="10" />
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack h="full" overflowY="auto">
			<Text fontSize="md" px="3" pt="3" pb="0" fontWeight="semibold">
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
			<Stack spacing="0">
				<Stack px="3" py="1" direction="row" fontWeight="medium" fontSize="sm">
					<Text width="50%">Column</Text>
					<Text width="20%" align="center">
						Editable
					</Text>
					<Text width="20%">Hidden</Text>
					<Text width="10%" />
				</Stack>
				{columns.map((column: any) => (
					<ColumnProperty tableType={type} key={column.name} {...column} />
				))}
			</Stack>
			<NewColumn variant="outline" ml="3" colorScheme="gray" />
		</Stack>
	);
};
