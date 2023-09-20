import { Button, Stack } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/FormInput';
import { BASE_SOURCE_FIELDS, SOURCE_BASED_INPUTS, WORKSPACE_ID } from '@/features/sources/constant';
import { useCreateSource } from '@/features/sources/hooks';
import { useToast } from '@/lib/chakra-ui';

export const NewSource = () => {
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
		createMutation.mutate({ ...values, workspaceId: WORKSPACE_ID });
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<Stack p="6" maxW="container.sm">
					{[...BASE_SOURCE_FIELDS, ...(SOURCE_BASED_INPUTS[sourceType] || [])].map(
						(field: any) => (
							<FormInput
								type={field.type}
								id={field.id}
								name={field.name}
								key={field.name}
								validation={{
									required: field.required,
								}}
								options={field.options}
							/>
						),
					)}

					<Button
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
	);
};
