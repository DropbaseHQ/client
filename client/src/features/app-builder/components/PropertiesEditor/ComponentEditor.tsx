import { useEffect } from 'react';
import { Save, Trash } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { Stack, IconButton, Text, ButtonGroup, Skeleton, StackDivider } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { FormInput } from '@/components/FormInput';
import { useResourceFields } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { NavLoader } from '@/components/Loader';
import { DisplayRulesEditor } from './DisplayRulesEditor';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { getErrorMessage } from '@/utils';
import { EventPropertyEditor } from '@/features/app-builder/components/PropertiesEditor/EventPropertyEditor';
import { LabelContainer } from '@/components/LabelContainer';
import { NameEditor } from '@/features/app-builder/components/NameEditor';

const TEMPLATE_REGEX = /\{\{(.+?)\}\}/;

export const ComponentPropertyEditor = () => {
	const toast = useToast();
	const [{ id, meta, type: inspectedResourceType }, setInspectedResource] =
		useAtom(inspectedResourceAtom);
	const { pageName, appName } = useAtomValue(pageAtom);

	const { widget: widgetName, table: tableName, resource } = meta || {};

	const { widgets, isLoading, tables, properties, files } = useGetPage({ appName, pageName });

	const component =
		resource === 'widget'
			? widgets
					.find((w: any) => w.name === widgetName)
					?.components?.find((c: any) => c.name === id)
			: tables
					.find((w: any) => w.name === tableName)
					?.[resource]?.find((c: any) => c.name === id);

	const { fields } = useResourceFields();

	const currentCategories = [
		...new Set(
			fields?.[component?.component_type]
				?.map((property: any) => property?.category)
				.filter(Boolean) || [],
		),
	];

	const functions = files.filter((f: any) => f.type === 'python')?.map((f: any) => f?.name);

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
		watch,
		setValue,
		clearErrors,
		setError,
	} = methods;

	const dataType = watch('data_type');
	const componentType = watch('component_type');
	const multiple = watch('multiple');
	const options = watch('options');
	const defaultValue = watch('default');
	const multiline = watch('multiline');
	const hasStateInDefault = watch('stateInDefault');
	const useFetcher = watch('use_fetcher');

	useEffect(() => {
		if (multiple) {
			if (!Array.isArray(defaultValue)) {
				setValue('default', hasStateInDefault ? defaultValue : [defaultValue], {
					shouldDirty: false,
				});
			}
		} else if (Array.isArray(defaultValue)) {
			setValue('default', defaultValue?.[0], {
				shouldDirty: false,
			});
		}
	}, [setValue, hasStateInDefault, defaultValue, multiple]);

	const updateMutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated component properties',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update component properties',
				description: getErrorMessage(error),
			});
		},
	});

	const deleteMutation = useUpdatePageData({
		onSuccess: () => {
			setInspectedResource({
				id: null,
				type: null,
				meta: null,
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete component',
				description: getErrorMessage(error),
			});
		},
	});

	useEffect(() => {
		reset(
			{ ...component, stateInDefault: TEMPLATE_REGEX.test(component?.default) },
			{
				keepDirty: false,
				keepDirtyValues: false,
			},
		);
	}, [component, reset]);

	const onSubmit = async ({ stateInDefault, ...formValues }: any) => {
		if (stateInDefault && !TEMPLATE_REGEX.test(formValues.default)) {
			setError('default', {
				message: `Invalid state value, please make sure you use template like {{state.table1.id}}`,
			});
			return;
		}

		if (resource === 'widget') {
			const currentWidget = properties[widgetName] || {};

			await updateMutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					[widgetName]: {
						...currentWidget,
						components: (currentWidget.components || []).map((c: any) => {
							if (c.name === id) {
								return {
									...c,
									...formValues,
								};
							}

							return c;
						}),
					},
				},
			});
		} else if (tableName) {
			const currentTable = properties[tableName] || {};

			await updateMutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					[tableName]: {
						...currentTable,
						[resource]: (currentTable?.[resource] || []).map((c: any) => {
							if (c.name === id) {
								return {
									...c,
									...formValues,
								};
							}

							return c;
						}),
					},
				},
			});
		}
	};

	const handleUpdateName = async (newName: any) => {
		try {
			await onSubmit({
				name: newName,
			});

			setInspectedResource({
				id: newName,
				type: inspectedResourceType,
				meta,
			});
		} catch (e) {
			//
		}
	};

	if (isLoading) {
		return (
			<Stack bg="white" h="full">
				<NavLoader isLoading />
				<Stack borderBottomWidth="1px" p="5">
					<Skeleton startColor="gray.100" endColor="gray.200" h={8} />
					<Skeleton startColor="gray.100" endColor="gray.200" h={8} />
					<Skeleton startColor="gray.100" endColor="gray.200" h={8} />
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack h="full" overflowY="auto" w="full" bg="white">
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
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
								<LabelContainer.Code>{id}</LabelContainer.Code>
							</LabelContainer>
							{false ? (
								<NameEditor
									value={id}
									currentNames={(properties?.[widgetName]?.components || []).map(
										(c: any) => c.name,
									)}
									onUpdate={handleUpdateName}
									resource="component"
								/>
							) : null}
						</Stack>

						<ButtonGroup ml="auto" size="xs">
							{isDirty ? (
								<IconButton
									aria-label="Update component"
									isLoading={updateMutation.isLoading}
									type="submit"
									data-cy="update-component"
									onClick={(e) => {
										e.stopPropagation();
									}}
									icon={<Save size="14" />}
								/>
							) : null}
							<IconButton
								aria-label="Delete component"
								variant="ghost"
								colorScheme="red"
								isLoading={deleteMutation.isLoading}
								onClick={(e) => {
									e.stopPropagation();

									const currentWidget = properties[widgetName] || {};

									deleteMutation.mutate({
										app_name: appName,
										page_name: pageName,
										properties: {
											...(properties || {}),
											[widgetName]: {
												...currentWidget,
												components: currentWidget?.components.filter(
													(c: any) => c?.name !== component?.name,
												),
											},
										},
									});
								}}
								icon={<Trash size="14" />}
							/>
						</ButtonGroup>
					</Stack>
					<Stack spacing="0" divider={<StackDivider />}>
						{currentCategories.map((category: any) => (
							<Stack spacing="3" p="3">
								{category.toLowerCase() === 'default' ? null : (
									<Text fontSize="md" fontWeight="semibold">
										{category}
									</Text>
								)}
								<Stack>
									{fields[component?.component_type]
										.filter((property: any) => property.category === category)
										.map((property: any) => {
											if (property?.name === 'name') {
												return null;
											}

											if (property.name === 'default') {
												let inputType = dataType;

												if (componentType === 'select') {
													inputType = 'select';

													if (multiple) {
														inputType = 'multiselect';
													}
												}

												if (dataType === 'text' && multiline) {
													inputType = 'textarea';
												}

												return (
													<Stack>
														<FormInput
															{...property}
															id={property.name}
															name={property.title}
															type={
																hasStateInDefault
																	? 'template'
																	: inputType
															}
															options={options}
														/>
														<FormInput
															id="stateInDefault"
															name="Use state in default value"
															type="boolean"
															onChange={(value: any) => {
																setValue('stateInDefault', value);
																setValue('default', null);
																clearErrors('default');
															}}
														/>
													</Stack>
												);
											}

											if (
												property.name === 'display_rules' ||
												property.type === 'rules'
											) {
												return (
													<DisplayRulesEditor
														widgetName={widgetName}
														name={component.name}
													/>
												);
											}

											if (property.category === 'Events') {
												return <EventPropertyEditor id={property.name} />;
											}

											if (property.name === 'fetcher') {
												if (!useFetcher) return null;

												return (
													<EventPropertyEditor
														id="fetcher"
														title={property.title}
														showFetchersOnly
													/>
												);
											}

											if (
												(property.name === 'fetcher' ||
													property.name === 'name_column' ||
													property.name === 'value_column') &&
												!component?.use_fetcher
											) {
												return null;
											}

											const showFunctionList = property.type === 'function';

											return (
												<FormInput
													{...property}
													id={property.name}
													name={property.title}
													type={
														showFunctionList
															? 'select'
															: (property.type === 'string' &&
																	'markdown') ||
															  property.type
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
				</FormProvider>
			</form>
		</Stack>
	);
};
