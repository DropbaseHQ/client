import { Box, Button, IconButton, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrowLeft } from 'react-feather';

import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/FormInput';
import { BASE_SOURCE_FIELDS, SOURCE_BASED_INPUTS } from '@/features/sources/constant';
import { useCreateSource } from '@/features/sources/hooks';
import { useToast } from '@/lib/chakra-ui';
import { workspaceAtom } from '@/features/workspaces';
import { PageLayout } from '@/layout';

export const NewSource = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	console.log(workspaceId);
	const navigate = useNavigate();
	const toast = useToast();
	const methods = useForm();

	const { watch } = methods;
	const sourceType = watch('type');

	const createMutation = useCreateSource({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Source added',
			});
			navigate('..');
		},
	});

	const onSubmit = (values: any) => {
		createMutation.mutate({ ...values, workspaceId });
	};

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
					<Box>New Source</Box>
				</Stack>
			}
		>
			<Stack bg="white" borderWidth={1} borderRadius="sm" p="6" maxW="container.sm">
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)}>
						<Stack>
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

							<Button
								mt="3"
								isLoading={createMutation.isLoading}
								type="submit"
								colorScheme="blue"
								size="sm"
							>
								Submit
							</Button>
						</Stack>
					</form>
				</FormProvider>
			</Stack>
		</PageLayout>
	);
};
