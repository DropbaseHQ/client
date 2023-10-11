import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Stack, Skeleton, Button, Text } from '@chakra-ui/react';
import { useGetWidget, useUpdateWidgetProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';

export const WidgetProperties = ({ widgetId }: any) => {
	const {
		isLoading,
		schema,
		values: { property: properties },
		refetch,
	} = useGetWidget(widgetId || '');

	const mutation = useUpdateWidgetProperties({
		onSuccess: () => {
			refetch();
		},
	});

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	useEffect(() => {
		reset(properties, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [properties, reset]);

	const onSubmit = (formValues: any) => {
		if (widgetId)
			mutation.mutate({
				widgetId,
				payload: formValues,
			});
	};

	return (
		<Stack spacing="0.5" h="full" bg="white">
			<Text p="3" borderBottomWidth="1px" fontWeight="semibold" size="sm">
				{properties?.name} Properties
			</Text>
			<Skeleton isLoaded={!isLoading}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormProvider {...methods}>
						<Stack p="4" spacing="3">
							{schema.map((property: any) => (
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
			</Skeleton>
		</Stack>
	);
};
