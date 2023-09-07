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
import { useGetWidget, useUpdateWidgetProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';

const WIDGET_ID = '62a43f32-89f6-4143-a8e9-57cbdf0889b1';

export const WidgetProperties = () => {
	const {
		isLoading,
		schema,
		values: { property: properties },
		refetch,
	} = useGetWidget(WIDGET_ID);

	const mutation = useUpdateWidgetProperties({
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
		reset(properties, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [properties, reset]);

	const onSubmit = (formValues: any) => {
		mutation.mutate({
			widgetId: WIDGET_ID,
			payload: formValues,
		});
	};

	return (
		<Skeleton isLoaded={!isLoading}>
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
		</Skeleton>
	);
};
