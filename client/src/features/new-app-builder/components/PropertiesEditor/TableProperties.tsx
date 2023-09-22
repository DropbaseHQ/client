import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { Stack, Skeleton, Box, Button, Text } from '@chakra-ui/react';
import { useGetTable, useUpdateTableProperties } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { pageAtom } from '@/features/new-page';
import { useSources } from '@/features/sources/hooks';
import { workspaceAtom } from '@/features/workspaces';
import { NewSourceForm } from '@/features/sources/routes/NewSource';

export const TableProperties = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, values, sourceId, refetch } = useGetTable(tableId || '');

	const { sources, isLoading: isLoadingSources } = useSources(workspaceId);

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

	if (!isLoadingSources && sources.length === 0) {
		return (
			<Stack
				p="4"
				m="3"
				maxH="full"
				borderRadius="sm"
				borderWidth="1px"
				bg="white"
				spacing="4"
			>
				<Stack spacing="0">
					<Text fontSize="lg" fontWeight="semibold">
						Create source
					</Text>
					<Text color="gray.600" fontSize="sm">
						Create source to build tables & apps
					</Text>
				</Stack>
				<Box h="full" overflow="auto">
					<NewSourceForm />
				</Box>
			</Stack>
		);
	}

	return (
		<Stack p="3" m="3" maxH="full" borderRadius="sm" borderWidth="1px" bg="white">
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
								options={sources.map((s: any) => ({
									value: s.id,
									name: s.name,
								}))}
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
									Run
								</Button>
							) : null}
						</Stack>
					</FormProvider>
				</form>
			</Skeleton>
		</Stack>
	);
};
