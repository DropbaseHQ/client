import { Button, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/FormInput';
import { BASE_SOURCE_FIELDS, SOURCE_BASED_INPUTS } from '@/features/sources/constant';
import { useCreateSource } from '@/features/sources/hooks';
import { useToast } from '@/lib/chakra-ui';
import { workspaceAtom } from '@/atoms';

export const NewSource = () => {
	const workspaceId = useAtomValue(workspaceAtom);
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
		<Stack bg="white" borderWidth={1} borderRadius="sm" p="6" m="6" maxW="container.sm">
			<FormProvider {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<Stack>
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
									options={field.options?.map((o: any) => ({
										name: o,
										value: o,
									}))}
								/>
							),
						)}

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
	);
};
