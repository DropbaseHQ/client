import { Button, Stack } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';

import { FormInput } from '@/components/FormInput';
import { BASE_SOURCE_FIELDS, SOURCE_BASED_INPUTS } from '@/features/sources/constant';
import { useCreateSource } from '@/features/sources/hooks';

export const NewSource = () => {
	const methods = useForm();

	const { watch } = methods;
	const sourceType = watch('type');

	const mutation = useCreateSource();

	const onSubmit = (values: any) => {
		console.log(values);
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
								enum={field.options}
							/>
						),
					)}

					<Button type="submit" colorScheme="blue" size="sm">
						Submit
					</Button>
				</Stack>
			</form>
		</FormProvider>
	);
};
