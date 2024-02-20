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

const VISIBLE_FIELDS = [
	'schema_name',
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
	} = methods;

	const { properties: pageProperties } = useGetPage({ appName, pageName });

	const { isOpen, onToggle } = useDisclosure();
	const { isOpen: isConfigurationOpen, onToggle: onToggleConfigurations } = useDisclosure();

	const { fields: resourceFields } = useResourceFields();
	let columnField = '';

	if (properties?.column_type === 'postgres') {
		columnField = 'pgcolumn';
	} else if (properties?.column_type === 'python') {
		columnField = 'pycolumn';
	} else if (properties?.column_type === 'button_column') {
		columnField = 'button_column';
	}

	const columnFields = resourceFields?.[columnField] || [];

	// const allFieldsName = columnFields.map((field: any) => field.name);

	const displayType = watch('display_type');

	const allDisplayConfigurations = resourceFields.display_type_configurations;
	const displayConfiguration =
		allDisplayConfigurations?.find((d: any) => d.name === displayType) || [];
	const configProperties = displayConfiguration?.properties || {};

	const editableFields = VISIBLE_EDITABLE_FIELDS?.[columnField];

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
								if (c.name === defaultName) {
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

	const allVisibleFields = columnFields.filter((f: any) => VISIBLE_FIELDS.includes(f.name)) || [];

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
								{isDirty ? (
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
							{columnFields
								.filter((f: any) => editableFields?.includes(f?.name))
								.map((f: any) => {
									if (f.name === 'display_type') {
										return (
											<FormInput
												type="custom-select"
												id={f.name}
												name={f.title}
												w="50%"
												hideClearOption
												options={resolveDisplayTypeOptions(displayType).map(
													(option: any) => ({
														name: option,
														value: option,
													}),
												)}
												onSelect={resetConfig}
											/>
										);
									}

									if (f?.category === 'Events') {
										return <EventPropertyEditor id={f.name} />;
									}

									return (
										<FormInput
											{...f}
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

							{Object.keys(configProperties).length > 0 ? (
								<SimpleGrid py="2" gap={4} columns={2}>
									{Object.keys(configProperties).map((key: any) => {
										const property = configProperties?.[key];
										const isRequired =
											displayConfiguration?.required?.includes(key);
										return (
											<Box
												gridColumn={
													property.type === 'array' ? '1 / -1' : ''
												}
											>
												<FormInput
													key={key}
													type={property?.type}
													id={`configurations.${key}`}
													name={key}
													keys={
														key === 'options'
															? ['label', 'value']
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
							) : null}

							{allVisibleFields.length > 0 ? (
								<Button
									variant="outline"
									colorScheme="gray"
									size="xs"
									w="fit-content"
									onClick={onToggleConfigurations}
								>
									Show {isConfigurationOpen ? 'Less' : 'More'} Info
								</Button>
							) : null}

							<Collapse in={isConfigurationOpen}>
								<SimpleGrid mt="2" alignItems="center" gap={4} columns={2}>
									{allVisibleFields.map((property: any) => (
										<Stack spacing="0.5" key={property.name}>
											<FormLabel>{property.name}</FormLabel>

											<Code bg="transparent" fontSize="sm">
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
			<Stack direction="row" pb="2" px="3" alignItems="center">
				<Text fontSize="md" fontWeight="semibold">
					Columns
				</Text>
			</Stack>
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
				<SimpleGrid
					p="2"
					fontWeight="medium"
					fontSize="sm"
					bg="gray.50"
					borderBottomWidth="1px"
					columns={3}
				>
					<Text>Column</Text>
					<Text>Editable</Text>
					<Text>Hidden</Text>
				</SimpleGrid>
				{columns.map((column: any) => (
					<ColumnProperty tableType={type} key={column.name} {...column} />
				))}
			</Stack>
			<NewColumn variant="outline" ml="3" colorScheme="gray" />
		</Stack>
	);
};
