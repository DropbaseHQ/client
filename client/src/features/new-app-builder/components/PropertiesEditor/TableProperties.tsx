import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { Stack, Skeleton, Button, Box } from '@chakra-ui/react';
import { useGetTable, useUpdateTableProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { pageAtom } from '@/features/new-page';

export const TableProperties = () => {
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, properties, values, refetch } = useGetTable(tableId || '');

	const [errorLog, setErrorLog] = useState('');

	const mutation = useUpdateTableProperties({
		onSuccess: () => {
			refetch();
		},
		onError: (error: any) => {
			setErrorLog(error?.response?.data?.error || '');
		},
	});

	const methods = useForm();
	const {
		formState: { isDirty },
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
						{properties
							.filter((f: any) => f.name !== 'filters')
							.map((property: any) => (
								<React.Fragment key={property.name}>
									<FormInput {...property} id={property.name} />

									{property.name === 'code' && errorLog ? (
										<Box
											mt="-1.5"
											fontSize="xs"
											color="red.500"
											bg="white"
											p="2"
											borderRadius="sm"
											as="pre"
											fontFamily="mono"
										>
											{errorLog}
										</Box>
									) : null}
								</React.Fragment>
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
