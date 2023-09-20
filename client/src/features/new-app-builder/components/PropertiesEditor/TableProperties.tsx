import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { Stack, Skeleton, Box, Button } from '@chakra-ui/react';
import { useGetTable, useUpdateTableProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { pageAtom } from '@/features/new-page';
import { useSources } from '@/features/sources/hooks';
import { WORKSPACE_ID } from '@/features/sources/constant';

export const TableProperties = () => {
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, values, sourceId, refetch } = useGetTable(tableId || '');

	const { sources } = useSources(WORKSPACE_ID);

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
		reset,
		formState: { touchedFields, isDirty },
	} = methods;

	useEffect(() => {
		reset(
			{ ...values, sourceId },
			{
				keepDirty: false,
				keepDirtyValues: false,
			},
		);
	}, [values, sourceId, reset]);

	const onSubmit = ({ sourceId: newSourceId, ...rest }: any) => {
		mutation.mutate({
			tableId: tableId || '',
			payload: rest,
			sourceId: newSourceId,
		});
	};

	return (
		<Skeleton isLoaded={!isLoading}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack p="3" spacing="4">
						<FormInput
							type="select"
							id="sourceId"
							name="Source"
							placeholder="Select source "
							validation={{ required: 'Source is required' }}
							options={sources.map((s: any) => s.id)}
						/>

						<FormInput id="name" name="Table Name" type="text" />

						<Stack spacing="0">
							<FormInput id="code" name="SQL Code" type="sql" />
							{errorLog ? (
								<Box
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
						</Stack>

						{Object.keys(touchedFields).length > 0 || isDirty ? (
							<Button
								size="sm"
								w="max-content"
								variant="outline"
								flexGrow="0"
								isLoading={mutation.isLoading}
								type="submit"
							>
								Update
							</Button>
						) : null}
					</Stack>
				</FormProvider>
			</form>
		</Skeleton>
	);
};
