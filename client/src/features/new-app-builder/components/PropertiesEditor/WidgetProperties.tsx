import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Stack, Skeleton, Button } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { useGetWidget, useUpdateWidgetProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { pageAtom } from '@/features/new-page';

export const WidgetProperties = () => {
	const { widgetId } = useAtomValue(pageAtom);
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
		<Skeleton isLoaded={!isLoading}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack>
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
	);
};
