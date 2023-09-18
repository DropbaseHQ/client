import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { Stack, Box, Skeleton, Button } from '@chakra-ui/react';
import { FormInput } from '@/components/FormInput';
import {
	useGetColumnProperties,
	useUpdateColumnProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';

const ColumnProperty = ({ id, property: properties }: any) => {
	const { tableId } = useAtomValue(pageAtom);
	const { schema, refetch } = useGetColumnProperties(tableId || '');

	const methods = useForm();
	const {
		formState: { isDirty },
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

export const Columns = () => {
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, values } = useGetColumnProperties(tableId || '');

	if (isLoading) {
		return <Skeleton h="xs" />;
	}

	return (
		<Stack direction="row" spacing="4" overflowX="auto" flexWrap="nowrap">
			{values.map((value: any) => (
				<ColumnProperty key={value.id} {...value} />
			))}
		</Stack>
	);
};
