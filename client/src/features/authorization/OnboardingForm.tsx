import {
	Stack,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	useDisclosure,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';

import { useAtomValue } from 'jotai';

import { FormInput } from '@/components/FormInput';

import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { onboardingAtom } from '.';
import { useOnboard } from './hooks/useOnboard';

export const OnboardingForm = () => {
	const toast = useToast();

	const onboardingState = useAtomValue(onboardingAtom);

	const defaultValues =
		typeof onboardingState !== 'boolean'
			? {
					name: onboardingState.name,
					last_name: onboardingState.last_name,
				}
			: {};

	const methods = useForm({
		defaultValues,
	});

	const { isOpen, onClose } = useDisclosure({
		defaultIsOpen: !!onboardingState,
	});

	const { mutate: onboard, isLoading: onboardLoading } = useOnboard({
		onSuccess: () => {
			onClose();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Error while onboarding',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = (data: any) => {
		let { name, last_name: lastName } = data;
		const { company } = data;

		if (typeof onboardingState !== 'boolean') {
			name = onboardingState.name;
			lastName = onboardingState.last_name;
		}

		onboard({ name, last_name: lastName, company });
	};

	return (
		<Modal isOpen={isOpen} onClose={() => null}>
			<ModalOverlay />
			<ModalContent>
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)}>
						<ModalHeader fontSize="md" borderBottomWidth="1px">
							Welcome to Dropbase!
						</ModalHeader>
						<ModalBody py="6">
							<Stack spacing="3">
								{typeof onboardingState === 'boolean' ? (
									<FormInput
										name="First Name"
										id="name"
										placeholder="Please enter your first name"
									/>
								) : (
									<FormInput
										name="First Name"
										id="name"
										value={onboardingState?.name}
										readOnly
									/>
								)}

								{typeof onboardingState === 'boolean' ? (
									<FormInput
										name="Last Name"
										id="last_name"
										placeholder="Please enter your last name"
									/>
								) : (
									<FormInput
										name="Last Name"
										id="last_name"
										value={onboardingState?.last_name}
										readOnly
									/>
								)}

								<FormInput
									name="Company"
									id="company"
									placeholder="Please enter your company"
								/>
							</Stack>
						</ModalBody>
						<ModalFooter borderTopWidth="1px">
							<Button
								colorScheme="blue"
								isLoading={onboardLoading}
								type="submit"
								size="sm"
							>
								Continue
							</Button>
						</ModalFooter>
					</form>
				</FormProvider>
			</ModalContent>
		</Modal>
	);
};
