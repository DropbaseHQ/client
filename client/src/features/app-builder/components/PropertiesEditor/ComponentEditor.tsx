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
import { useResourceFields, useDeleteComponent } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { NavLoader } from '@/components/Loader';
import { DisplayRulesEditor } from './DisplayRulesEditor';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { getErrorMessage } from '@/utils';

export const ComponentPropertyEditor = ({ id }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);
	const { widgetName, pageName, appName } = useAtomValue(pageAtom);

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

	const functions = files.filter((f: any) => f.type === 'ui')?.map((f: any) => f?.name);

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

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

	const deleteMutation = useDeleteComponent({
		onSuccess: () => {
			setInspectedResource({
				id: null,
				type: null,
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
		reset(component, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [component, reset]);

	const onSubmit = (formValues: any) => {
		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				widgets: [
					...(properties?.widgets || []).map((w: any) => {
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
						<Text fontWeight="semibold" size="sm">
							{component?.name || id} Properties
						</Text>

						<ButtonGroup ml="auto" size="xs">
							{isDirty ? (
								<IconButton
									aria-label="Update component"
									isLoading={updateMutation.isLoading}
									type="submit"
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
										componentId: id,
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
											if (
												property.name === 'display_rules' ||
												property.type === 'rules'
											) {
												return <DisplayRulesEditor name={component.name} />;
											}

											const showFunctionList =
												property.type === 'function' ||
												property.name === 'on_click' ||
												property.name === 'on_change';

											return (
												<FormInput
													{...property}
													id={property.name}
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
				</FormProvider>
			</form>
		</Stack>
	);
};

export const NewComponent = (props: any) => {
	const toast = useToast();
	const { isConnected } = useStatus();
	const { widgetName, appName, pageName } = useAtomValue(pageAtom);
	const { properties } = useGetPage({ appName, pageName });
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdatePageData({
		onSuccess: (data: any) => {
			setInspectedResource({
				id: data.id,
				type: 'component',
			});
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

	const onSubmit = ({ type }: any) => {
		const currentNames = (
			properties?.widgets?.find((w: any) => w.name === widgetName)?.components || []
		)
			.filter((c: any) => c.component_type === type)
			.map((c: any) => c.name);

		let nameIndex = 1;

		while (currentNames.includes(`${type}${nameIndex}`)) {
			nameIndex += 1;
		}

		const newName = `${type}${nameIndex}`;

		let otherProperty: any = {
			label: newName,
		};

		if (type === 'input') {
			otherProperty = { type: 'text', label: newName };
		}

		if (type === 'text') {
			otherProperty = {
				text: newName,
			};
		}

		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				widgets: [
					...(properties?.widgets || []).map((w: any) => {
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
	};

	return (
		<Menu>
			<MenuButton
				as={Button}
				variant="ghost"
				size="sm"
				flexShrink="0"
				mr="auto"
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
				{['input', 'text', 'select', 'button'].map((c) => (
					<MenuItem
						onClick={() => {
							onSubmit({ type: c });
						}}
						key={c}
					>
						{c}
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
};
