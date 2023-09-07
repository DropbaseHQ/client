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
	useGetColumnProperties,
	useUpdateColumnProperties,
} from '@/features/new-app-builder/hooks';

const ColumnProperty = ({ id, property: properties }: any) => {
	const { schema, refetch } = useGetColumnProperties('b37ba8d3-6f5f-47a0-9d98-d749ccb8d4a2');

	const methods = useForm();
	const {
		formState: { errors, isDirty },
		reset,
	} = methods;

	const mutation = useUpdateColumnProperties({
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
			columnId: id,
			payload: formValues,
			type: 'postgres',
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

export const Columns = () => {
	const { isLoading, values } = useGetColumnProperties('b37ba8d3-6f5f-47a0-9d98-d749ccb8d4a2');

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack direction="row" spacing="4" overflowX="auto" flexWrap="nowrap">
			{values.map((value: any) => (
				<ColumnProperty key={value.id} {...value} />
			))}
		</Stack>
	);
};
