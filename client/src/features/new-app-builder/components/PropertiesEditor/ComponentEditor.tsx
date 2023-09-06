import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import {
	FormLabel,
	FormControl,
	Stack,
	FormErrorMessage,
	Box,
	Skeleton,
	Button,
} from '@chakra-ui/react';
import { FormInput } from '@/components/FormInput';
import {
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';

const WIDGET_ID = '29261240-d36e-4cf6-82ea-7dfb41ede6f1';

const ComponentPropertyEditor = ({ id, type, property: properties }: any) => {
	const { schema, refetch } = useGetComponentProperties(WIDGET_ID);

	const methods = useForm();
	const {
		formState: { errors, isDirty },
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
						{schema.map((property: any) => (
							<FormControl isInvalid={!!errors?.[property.name]} key={property.name}>
								<FormLabel>{property.name}</FormLabel>

								<FormInput {...property} />
								<ErrorMessage
									errors={errors}
									name="singleErrorInput"
									render={({ message }) => (
										<FormErrorMessage>{message}</FormErrorMessage>
									)}
								/>
							</FormControl>
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

export const Components = () => {
	const { isLoading, values } = useGetComponentProperties(WIDGET_ID);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack direction="row" spacing="4" overflowX="auto" flexWrap="nowrap">
			{values.map((value: any) => (
				<ComponentPropertyEditor key={value.id} {...value} />
			))}
		</Stack>
	);
};
