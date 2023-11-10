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
import { useParams } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';

import { FormInput } from '@/components/FormInput';
import {
	useAllPageFunctionNames,
	useCreateComponents,
	useDeleteComponent,
	useGetComponentProperties,
	useSyncComponents,
	useUpdateComponentProperties,
} from '@/features/app-builder/hooks';
import { pageAtom } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { NavLoader } from '@/components/Loader';
import { DisplayRulesEditor } from './DisplayRulesEditor';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';

export const ComponentPropertyEditor = ({ id }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);
	const { widgetId, pageName, appName } = useAtomValue(pageAtom);
	const { schema, refetch, values, isLoading, categories } = useGetComponentProperties(
		widgetId || '',
	);

	const { type, property: properties } = values.find((v: any) => v.id === id) || {};
	const currentCategories = (categories as any)?.[type] || [];

	const { pageId } = useParams();

	const { functions } = useAllPageFunctionNames({ pageId });

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	const syncToWorker = useSyncComponents();

	const updateMutation = useUpdateComponentProperties({
		onSuccess: (_: any, variables: any) => {
			toast({
				status: 'success',
				title: 'Updated component properties',
			});

			if (variables.payload?.name !== properties?.name) {
				syncToWorker.mutate({ appName, pageName });
			}

			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update component properties',
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
			});
		},
	});

	const deleteMutation = useDeleteComponent({
		onSuccess: () => {
			setInspectedResource({
				id: null,
				type: null,
			});
			refetch();
			setInspectedResource({
				id: null,
				type: null,
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete component',
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
			});
		},
	});

	useEffect(() => {
		reset(properties, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [properties, reset]);

	const onSubmit = (formValues: any) => {
		updateMutation.mutate({
			componentId: id,
			payload: formValues,
			type,
		});
	};

	const allProperties = schema[type] || [];

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
							{properties.name} Properties
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
									{allProperties
										.filter((property: any) => property.category === category)
										.map((property: any) => {
											if (
												property.name === 'display_rules' ||
												property.type === 'rules'
											) {
												return <DisplayRulesEditor id={id} />;
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
	const { widgetId, appName, pageName } = useAtomValue(pageAtom);
	const { values } = useGetComponentProperties(widgetId || '');

	const syncComponents = useSyncComponents();

	const mutation = useCreateComponents({
		onSuccess: () => {
			syncComponents.mutate({
				appName,
				pageName,
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
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
			});
		},
	});

	const onSubmit = ({ type }: any) => {
		const currentNames = values
			.filter((c: any) => c.type === type)
			.map((c: any) => c.property.name);

		let nameIndex = 1;

		while (currentNames.includes(`${type}${nameIndex}`)) {
			nameIndex += 1;
		}

		const newName = `${type}${nameIndex}`;

		let otherProperty: any = {
			label: newName,
		};

		if (type === 'text') {
			otherProperty = {
				text: newName,
			};
		}

		mutation.mutate({
			widgetId,
			property: { name: newName, ...otherProperty },
			type,
			after: values?.[values.length - 1]?.id || null,
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
