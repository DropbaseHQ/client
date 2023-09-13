import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
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
import { pageAtom } from '@/features/new-page';

export const TableProperties = () => {
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, properties, values, refetch } = useGetTable(tableId || '');

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
			tableId: tableId || '',
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
									name={property.name}
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
