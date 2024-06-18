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
import { useMutation } from 'react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { workerAxios } from '@/lib/axios';

import { FormInput } from '@/components/FormInput';

import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';

const onboard = async (data: any) => {
	const response = await workerAxios.post<any>(`/workspaces/onboarding`, data);

	return response.data;
};

export const OnboardingModal = () => {
	const toast = useToast();

	const methods = useForm();

	const { isOpen, onClose, onToggle } = useDisclosure();

	useGetWorkspaceApps({
		onSuccess: (data: any) => {
			if (!data?.owner) {
				onToggle();
			}
		},
	});

	const { mutate, isLoading: onboardLoading } = useMutation(onboard, {
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Onboarding complete',
			});
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
		mutate(data);
	};

	return (
		<Modal isOpen={isOpen} size="xl" isCentered onClose={() => null}>
			<ModalOverlay />
			<ModalContent>
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)}>
						<ModalHeader borderBottomWidth="1px">Welcome to Dropbase!</ModalHeader>
						<ModalBody py="6">
							<Stack spacing="3">
								<FormInput
									name="Email"
									id="email"
									type="email"
									placeholder="Please enter your email"
									validation={{
										required: 'Cannot  be empty',
									}}
								/>

								<Stack direction="row">
									<FormInput
										name="First Name"
										id="first_name"
										placeholder="Please enter your first name"
										validation={{
											required: 'Cannot  be empty',
										}}
									/>

									<FormInput
										name="Last Name"
										id="last_name"
										placeholder="Please enter your last name"
									/>
								</Stack>

								<FormInput
									name="Usecase"
									id="use_case"
									placeholder="Please select your usecase"
									type="custom-select"
									options={[
										{
											name: 'Research',
											value: 'research',
										},
										{
											name: 'Internal Tools',
											value: 'internal_tools',
										},
									]}
									validation={{
										required: 'Cannot  be empty',
									}}
								/>

								<FormInput
									name="Additional Notes"
									id="notes"
									placeholder="Please mention additional notes"
									type="textarea"
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
								Finish
							</Button>
						</ModalFooter>
					</form>
				</FormProvider>
			</ModalContent>
		</Modal>
	);
};
