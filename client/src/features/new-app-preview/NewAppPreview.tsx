import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Skeleton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { RefreshCw } from 'react-feather';

import { ErrorMessage } from '@hookform/error-message';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetWidgetPreview } from '@/features/new-app-preview/hooks';
import { FormInput } from '@/components/FormInput';

export const NewAppPreview = () => {
	const { isLoading, refetch, components, widget, isRefetching } = useGetWidgetPreview(
		'29261240-d36e-4cf6-82ea-7dfb41ede6f1',
	);

	const methods = useForm();
	const {
		formState: { errors },
	} = methods;

	return (
		<Stack bg="white" h="full">
			<Skeleton isLoaded={!isLoading}>
				<Stack
					px="4"
					py="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Stack spacing="0">
						<Text fontSize="md" fontWeight="semibold">
							{widget?.property?.name}
						</Text>
						{widget?.property?.description ? (
							<Text fontSize="sm" color="gray.600">
								{widget?.property?.description}
							</Text>
						) : null}
					</Stack>

					<IconButton
						aria-label="Refresh UI"
						size="xs"
						icon={<RefreshCw size="14" />}
						variant="outline"
						isLoading={isRefetching}
						onClick={() => refetch()}
					/>
				</Stack>
				<form>
					<FormProvider {...methods}>
						<Stack p="4">
							{components.map((c: any) => {
								const component = c.property;

								return (
									<FormControl
										isInvalid={!!errors?.[component.name]}
										key={component.name}
									>
										<FormLabel>{component.label}</FormLabel>

										<FormInput name={component.name} type={component.type} />
										<ErrorMessage
											errors={errors}
											name={component.name}
											render={({ message }) => (
												<FormErrorMessage>{message}</FormErrorMessage>
											)}
										/>
									</FormControl>
								);
							})}
						</Stack>
					</FormProvider>
				</form>
			</Skeleton>
		</Stack>
	);
};
