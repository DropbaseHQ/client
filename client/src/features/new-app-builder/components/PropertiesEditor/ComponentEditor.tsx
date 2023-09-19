import { useEffect } from 'react';
import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import {
	Stack,
	Box,
	Skeleton,
	Button,
	IconButton,
	MenuButton,
	Menu,
	MenuList,
	MenuItem,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { FormInput } from '@/components/FormInput';
import {
	useCreateComponents,
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';

const ComponentPropertyEditor = ({ id, type, property: properties }: any) => {
	const { widgetId } = useAtomValue(pageAtom);
	const { schema, refetch } = useGetComponentProperties(widgetId || '');

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

	return (
		<Box minW="sm" borderWidth="1px" p="3.5" maxW="md" borderRadius="md" bg="white">
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack>
						{(schema[type] || []).map((property: any) => (
							<FormInput {...property} id={property.name} key={property.name} />
						))}

						{isDirty ? (
							<Stack direction="row">
								<Button isLoading={mutation.isLoading} type="submit">
									Save
								</Button>
							</Stack>
						) : null}
					</Stack>
				</FormProvider>
			</form>
		</Box>
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
				as={IconButton}
				aria-label="Add function"
				icon={<Plus size="14" />}
				variant="outline"
				isLoading={mutation.isLoading}
			/>
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
		<Stack p="3" overflowY="auto" h="full">
			<NewComponent />
			<Stack direction="row" spacing="4" overflowX="auto" flexWrap="nowrap">
				{values.map((value: any) => (
					<ComponentPropertyEditor key={value.id} {...value} />
				))}
			</Stack>
		</Stack>
	);
};
