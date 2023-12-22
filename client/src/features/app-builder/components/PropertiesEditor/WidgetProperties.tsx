import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Trash } from 'react-feather';
import { Stack, Skeleton, Button, Text, IconButton } from '@chakra-ui/react';
import {
	useDeleteWidget,
	useGetWidget,
	useUpdateWidgetProperties,
} from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { useSetAtom } from 'jotai';

export const WidgetProperties = ({ widgetId }: any) => {
	const toast = useToast();
	const {
		isLoading,
		schema,
		values: { property: properties },
		refetch,
	} = useGetWidget(widgetId || '');
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdateWidgetProperties({
		onSuccess: () => {
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update properties',
				description: getErrorMessage(error),
			});
		},
	});
	const deleteMutation = useDeleteWidget({
		onSuccess: () => {
			setInspectedResource({
				id: null,
				type: null,
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete widget',
				description: getErrorMessage(error),
			});
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
	const handleDeleteWidget = () => {
		if (widgetId)
			deleteMutation.mutate({
				widgetId,
			});
	};

	return (
		<Stack spacing="0.5" h="full" bg="white">
			<Stack py="1" px="3" direction="row" borderBottomWidth="1px" alignItems="center">
				<Text fontWeight="semibold" size="sm">
					{properties?.name} Properties
				</Text>
				<IconButton
					ml="auto"
					aria-label="Delete widget"
					variant="ghost"
					colorScheme="red"
					icon={<Trash size="14" />}
					onClick={handleDeleteWidget}
					isLoading={deleteMutation.isLoading}
				/>
			</Stack>

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
