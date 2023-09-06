import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import {
	FormLabel,
	FormControl,
	Stack,
	FormErrorMessage,
	Skeleton,
	Button,
} from '@chakra-ui/react';
import { useGetTable, useUpdateTableProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';

export const TableProperties = () => {
	const { isLoading, properties, values, refetch } = useGetTable(
		'05a2a44e-34ae-4b03-9dc2-a1b2b278ae34',
	);

	const mutation = useUpdateTableProperties({
		onSuccess: () => {
			refetch();
		},
	});

	const methods = useForm();
	const {
		formState: { errors, isDirty },
		reset,
	} = methods;

	useEffect(() => {
		reset(values, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [values, reset]);

	const onSubmit = (formValues: any) => {
		mutation.mutate({
			tableId: '05a2a44e-34ae-4b03-9dc2-a1b2b278ae34',
			payload: formValues,
		});
	};

	return (
		<Skeleton isLoaded={!isLoading}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack>
						{properties.map((property: any) => (
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

						<Stack direction="row">
							<Button
								isLoading={mutation.isLoading}
								isDisabled={!isDirty}
								type="submit"
							>
								Save
							</Button>
						</Stack>
					</Stack>
				</FormProvider>
			</form>
		</Skeleton>
	);
};
