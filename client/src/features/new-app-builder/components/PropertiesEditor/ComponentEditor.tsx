import { useEffect, useState } from 'react';
import { Plus, Save, Trash } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import {
	Stack,
	IconButton,
	MenuButton,
	Menu,
	MenuList,
	MenuItem,
	Accordion,
	Text,
	Button,
	ButtonGroup,
	Box,
	Skeleton,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { FormInput } from '@/components/FormInput';
import {
	useAllPageFunctionNames,
	useCreateComponents,
	useDeleteComponent,
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';
import { useToast } from '@/lib/chakra-ui';
import { ContentLoader, NavLoader } from '@/components/Loader';
import { DisplayRulesEditor } from './DisplayRulesEditor';

const DISPLAY_COMPONENT_PROPERTIES = ['name', 'type', 'options', 'label', 'text', 'size'];

export const ComponentPropertyEditor = ({ id }: any) => {
	const { pageId } = useParams();
	const { widgetId } = useAtomValue(pageAtom);
	const { schema, refetch, values, isLoading } = useGetComponentProperties(widgetId || '');

	const { type, property: properties } = values.find((v: any) => v.id === id) || {};

	const { functions } = useAllPageFunctionNames(pageId || '');

	const [visibleProperties, setVisibleProperties] = useState<any>(DISPLAY_COMPONENT_PROPERTIES);

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	const updateMutation = useUpdateComponentProperties({
		onSuccess: () => {
			refetch();
		},
	});

	const deleteMutation = useDeleteComponent({
		onSuccess: () => {
			refetch();
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
	const displayProperties = allProperties
		.filter((property: any) => {
			const propertyValue = properties?.[property.name];
			return (
				visibleProperties.includes(property.name) ||
				(propertyValue !== undefined && propertyValue !== null)
			);
		})
		.sort((a: any, b: any) => a.name.localeCompare(b.name));

	const displayPropertiesNames = displayProperties.map((p: any) => p.name);

	const propertiesToBeAdded = allProperties.filter(
		(p: any) => !displayPropertiesNames.includes(p.name),
	);

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
					<Stack maxW="md" p="4">
						{displayProperties.map((property: any) => {
							if (property.name === 'display_rules' || property.type === 'rules') {
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
									type={showFunctionList ? 'select' : property.type}
									options={(
										(showFunctionList
											? functions
											: property.enum || property.options) || []
									).map((o: any) => ({
										name: o,
										value: o,
									}))}
									key={property.name}
								/>
							);
						})}

						<Menu>
							<MenuButton
								as={Button}
								size="sm"
								variant="ghost"
								colorScheme="blue"
								flexShrink="0"
							>
								Add property
							</MenuButton>
							<MenuList>
								{propertiesToBeAdded.map((p: any) => (
									<MenuItem
										onClick={() => {
											setVisibleProperties([...visibleProperties, p.name]);
										}}
										key={p.name}
									>
										{p.name}
									</MenuItem>
								))}
							</MenuList>
						</Menu>
					</Stack>
				</FormProvider>
			</form>
		</Stack>
	);
};

export const NewComponent = (props: any) => {
	const toast = useToast();
	const { widgetId } = useAtomValue(pageAtom);
	const { values } = useGetComponentProperties(widgetId || '');

	const mutation = useCreateComponents({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Component added',
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

export const Components = () => {
	const { widgetId } = useAtomValue(pageAtom);
	const { isLoading, values } = useGetComponentProperties(widgetId || '');

	return (
		<Stack maxW="2xl" spacing="0" h="full">
			<Text
				flexShrink="0"
				bg="white"
				borderWidth="1px"
				borderBottomWidth="0"
				px="3"
				py="2"
				fontSize="sm"
				fontWeight="semibold"
			>
				Components
			</Text>
			<Stack overflowY="auto">
				<ContentLoader isLoading={isLoading}>
					<Accordion
						bg="white"
						borderLeftWidth="1px"
						borderRightWidth="1px"
						allowMultiple
					>
						{values.map((value: any) => (
							<ComponentPropertyEditor key={value.id} {...value} />
						))}
					</Accordion>
				</ContentLoader>
			</Stack>
			<Box mt="2">
				<NewComponent />
			</Box>
		</Stack>
	);
};
