import { Box, Button, IconButton, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrowLeft } from 'react-feather';

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { FormInput } from '@/components/FormInput';
import { BASE_SOURCE_FIELDS, SOURCE_BASED_INPUTS } from '@/features/sources/constant';
import { useDeleteSource, useSource, useUpdateSource } from '@/features/sources/hooks';
import { useToast } from '@/lib/chakra-ui';
import { workspaceAtom } from '@/features/workspaces';
import { PageLayout } from '@/layout';
import { Loader } from '@/components/Loader';

export const Source = () => {
	const navigate = useNavigate();
	const { sourceId } = useParams();
	const { source, isLoading } = useSource(sourceId || '');

	const workspaceId = useAtomValue(workspaceAtom);

	const toast = useToast();
	const methods = useForm();

	const { watch } = methods;
	const sourceType = watch('type');

	const updateMutation = useUpdateSource({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Source updated',
			});
		},
	});
	const deleteMutation = useDeleteSource({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Source deleted',
			});
			navigate('/source');
		},
	});

	const onSubmit = (values: any) => {
		updateMutation.mutate({ ...values, workspaceId });
	};

	const handleDelete = () => {
		deleteMutation.mutate({ sourceId });
	};

	useEffect(() => {
		methods.reset({ ...source });
	}, [source, methods]);

	return (
		<PageLayout
			title={
				<Stack direction="row" alignItems="center">
					<IconButton
						icon={<ArrowLeft size="16" />}
						aria-label="Go back to sources"
						as={Link}
						size="sm"
						variant="ghost"
						to=".."
					/>
					<Box>Update Source</Box>
				</Stack>
			}
		>
			<Stack maxW="container.sm">
				<Loader isLoading={isLoading}>
					<Stack bg="white" borderWidth={1} borderRadius="sm" p="6">
						<FormProvider {...methods}>
							<form onSubmit={methods.handleSubmit(onSubmit)}>
								<Stack h="full" overflowY="auto">
									{[
										...BASE_SOURCE_FIELDS,
										...(SOURCE_BASED_INPUTS[sourceType] || []),
									].map((field: any) => (
										<FormInput
											type={field.type}
											id={field.id}
											name={field.name}
											key={field.name}
											validation={{
												required: field.required,
											}}
											options={field.options?.map((o: any) => ({
												name: o,
												value: o,
											}))}
										/>
									))}

									<Stack mt="3" direction="row">
										<Button
											isLoading={updateMutation.isLoading}
											type="submit"
											colorScheme="blue"
											size="sm"
										>
											Update
										</Button>
										<Button
											colorScheme="red"
											ml="auto"
											isLoading={deleteMutation.isLoading}
											onClick={handleDelete}
											size="sm"
										>
											Delete
										</Button>
									</Stack>
								</Stack>
							</form>
						</FormProvider>
					</Stack>
				</Loader>
			</Stack>
		</PageLayout>
	);
};
