import {
	Stack,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
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
	const methods = useForm();
	const onboardingState = useAtomValue(onboardingAtom);

	const { isOpen, onClose } = useDisclosure({
		defaultIsOpen: onboardingState,
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
			onClose();
		},
	});

	const onSubmit = async ({ company }: any) => {
		onboard({ company });
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)}>
						<ModalHeader fontSize="md" borderBottomWidth="1px">
							Welcome to Dropbase!
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody py="6">
							<Stack spacing="2">
								<FormInput name="Company" id="company" placeholder="Company name" />
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
