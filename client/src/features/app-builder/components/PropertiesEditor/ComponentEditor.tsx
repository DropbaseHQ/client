import { useEffect } from 'react';
import { Plus, Save, Trash } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import {
	Stack,
	IconButton,
	MenuButton,
	Menu,
	MenuList,
	MenuItem,
	Text,
	Button,
	ButtonGroup,
	Box,
	Skeleton,
	StackDivider,
} from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useStatus } from '@/layout/StatusBar';
import { FormInput } from '@/components/FormInput';
import { useResourceFields } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { NavLoader } from '@/components/Loader';
import { DisplayRulesEditor } from './DisplayRulesEditor';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { generateSequentialName, getErrorMessage } from '@/utils';
import { NameEditor } from '@/features/app-builder/components/NameEditor';
import { EventPropertyEditor } from '@/features/app-builder/components/PropertiesEditor/EventPropertyEditor';
import { LabelContainer } from '@/components/LabelContainer';
import { DashedBorder } from '@/components/DashedBorder';

const TEMPLATE_REGEX = /\{\{(.+?)\}\}/;

export const ComponentPropertyEditor = ({ id, meta }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);
	const { pageName, appName } = useAtomValue(pageAtom);

	const { widget: widgetName } = meta || {};

	const { widgets, isLoading, properties, files } = useGetPage({ appName, pageName });

	const component = widgets
		.find((w: any) => w.name === widgetName)
		?.components?.find((c: any) => c.name === id);

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
			setValue('default', '', {
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

	const onSubmit = ({ stateInDefault, ...formValues }: any) => {
		if (stateInDefault && !TEMPLATE_REGEX.test(formValues.default)) {
			setError('default', {
				message: `Invalid state value, please make sure you use template like {{state.table1.id}}`,
			});
			return;
		}

		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				blocks: [
					...(properties?.blocks || []).map((w: any) => {
						if (w.name === widgetName) {
							return {
								...w,
								components: (w.components || []).map((c: any) => {
									if (c.name === id) {
										return {
											...c,
											...formValues,
										};
									}

									return c;
								}),
							};
						}

						return w;
					}),
				],
			},
		});
	};

	const handleUpdateName = async (newName: any) => {
		try {
			await updateMutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: [
						...(properties?.blocks || []).map((w: any) => {
							if (w.name === widgetName) {
								return {
									...w,
									components: (w.components || []).map((c: any) => {
										if (c.name === id) {
											return {
												...c,
												name: newName,
											};
										}

										return c;
									}),
								};
							}

							return w;
						}),
					],
				},
			});

			setInspectedResource({
				id: newName,
				type: 'component',
				meta: { widget: widgetName },
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
							<NameEditor
								value={id}
								currentNames={(
									properties?.blocks.find(
										(w: any) => w.name === (widgetName || ''),
									)?.components || []
								).map((c: any) => c.name)}
								onUpdate={handleUpdateName}
								resource="component"
							/>
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
									deleteMutation.mutate({
										app_name: appName,
										page_name: pageName,
										properties: {
											...(properties || {}),
											blocks: (properties.blocks || []).map((w: any) => {
												if (w.name === widgetName) {
													return {
														...w,
														components: w?.components.filter(
															(c: any) => c?.name !== component?.name,
														),
													};
												}

												return w;
											}),
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

export const NewComponent = ({ widgetName, ...props }: any) => {
	const toast = useToast();
	const { isConnected } = useStatus();
	const { appName, pageName } = useAtomValue(pageAtom);
	const { properties } = useGetPage({ appName, pageName });
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Component added',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create component',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = async ({ type }: any) => {
		const currentNames = (
			properties?.blocks?.find((w: any) => w.name === widgetName)?.components || []
		)
			.filter((c: any) => c.component_type === type)
			.map((c: any) => c.name);

		const { name: newName, label: newLabel } = generateSequentialName({
			currentNames,
			prefix: type,
		});

		let otherProperty: any = {
			label: newLabel,
		};

		if (type === 'input') {
			otherProperty = { type: 'text', label: newLabel };
		}

		if (type === 'text') {
			otherProperty = {
				text: newName,
			};
		}
		if (type === 'select') {
			otherProperty = {
				data_type: 'string',
				use_fetcher: false,
				label: newLabel,
			};
		}

		try {
			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: [
						...(properties?.blocks || []).map((w: any) => {
							if (w.name === widgetName) {
								return {
									...w,
									components: [
										...(w.components || []),
										{
											name: newName,
											component_type: type,
											...otherProperty,
										},
									],
								};
							}

							return w;
						}),
					],
				},
			});
			setInspectedResource({
				id: newName,
				type: 'component',
				meta: { widget: widgetName },
			});
		} catch (e) {
			//
		}
	};

	return (
		<DashedBorder>
			<Menu>
				<MenuButton
					as={Button}
					variant="ghost"
					size="sm"
					flexShrink="0"
					mr="auto"
					data-cy="add-component-button"
					isDisabled={!isConnected}
					isLoading={mutation.isLoading}
					{...props}
				>
					<Stack alignItems="center" justifyContent="center" direction="row">
						<Plus size="14" />
						<Box>Add Component</Box>
					</Stack>
				</MenuButton>
				<MenuList>
					{['input', 'text', 'select', 'button', 'boolean'].map((c) => (
						<MenuItem
							onClick={() => {
								onSubmit({ type: c });
							}}
							key={c}
							fontSize="md"
						>
							{c}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		</DashedBorder>
	);
};
