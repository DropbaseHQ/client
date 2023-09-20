import { useEffect, useState } from 'react';
import { Plus, Save } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import {
	Stack,
	Skeleton,
	IconButton,
	MenuButton,
	Menu,
	MenuList,
	MenuItem,
	Accordion,
	AccordionItem,
	AccordionButton,
	Spinner,
	AccordionIcon,
	Text,
	AccordionPanel,
	Button,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { FormInput } from '@/components/FormInput';
import {
	useCreateComponents,
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';

const DISPLAY_COMPONENT_PROPERTIES = ['name', 'type', 'options', 'label', 'text', 'size'];

const ComponentPropertyEditor = ({ id, type, property: properties }: any) => {
	const { widgetId } = useAtomValue(pageAtom);
	const { schema, refetch } = useGetComponentProperties(widgetId || '');

	const [visibleProperties, setVisibleProperties] = useState<any>(DISPLAY_COMPONENT_PROPERTIES);

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	const mutation = useUpdateComponentProperties({
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
		mutation.mutate({
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

	return (
		<AccordionItem>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<AccordionButton w="full">
						{mutation.isLoading ? <Spinner size="sm" /> : <AccordionIcon />}

						<Stack flex="1" ml="4" alignItems="center" direction="row">
							<Text size="sm">{properties.name}</Text>

							{isDirty ? (
								<IconButton
									aria-label="Update component"
									size="sm"
									isLoading={mutation.isLoading}
									type="submit"
									onClick={(e) => {
										e.stopPropagation();
									}}
									variant="ghost"
									icon={<Save size="14" />}
									ml="auto"
								/>
							) : null}
						</Stack>
					</AccordionButton>
					<AccordionPanel borderTopWidth="1px">
						<Stack p="2" maxW="md">
							{displayProperties.map((property: any) => (
								<FormInput {...property} id={property.name} key={property.name} />
							))}

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
												setVisibleProperties([
													...visibleProperties,
													p.name,
												]);
											}}
											key={p.name}
										>
											{p.name}
										</MenuItem>
									))}
								</MenuList>
							</Menu>
						</Stack>
					</AccordionPanel>
				</FormProvider>
			</form>
		</AccordionItem>
	);
};

export const NewComponent = () => {
	const { widgetId } = useAtomValue(pageAtom);
	const { values } = useGetComponentProperties(widgetId || '');

	const mutation = useCreateComponents({
		onSuccess: () => {},
	});

	const onSubmit = ({ type }: any) => {
		const currentNames = values
			.filter((c: any) => c.type === type)
			.map((c: any) => c.property.name);

		let nameIndex = 1;

		while (currentNames.includes(`${type}${nameIndex}`)) {
			nameIndex += 1;
		}

		mutation.mutate({
			widgetId,
			property: { name: `${type}${nameIndex}` },
			type,
		});
	};

	return (
		<Menu>
			<MenuButton
				as={Button}
				leftIcon={<Plus size="14" />}
				variant="ghost"
				size="sm"
				flexShrink="0"
				mr="auto"
				isLoading={mutation.isLoading}
			>
				New Component
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

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack overflowY="auto" h="full">
			<Accordion bg="white" borderLeftWidth="1px" borderRightWidth="1px" allowMultiple>
				{values.map((value: any) => (
					<ComponentPropertyEditor key={value.id} {...value} />
				))}
			</Accordion>

			<NewComponent />
		</Stack>
	);
};
