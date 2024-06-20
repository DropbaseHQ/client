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
	ListItem,
	OrderedList,
	Text,
} from '@chakra-ui/react';
import { useMutation } from 'react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { workerAxios } from '@/lib/axios';

import { FormInput } from '@/components/FormInput';

import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useState } from 'react';

const onboard = async (data: any) => {
	const response = await workerAxios.post<any>(`/workspaces/onboarding`, data);

	return response.data;
};

export const OnboardingModal = () => {
	const toast = useToast();

	const methods = useForm();

	const [showInfo, setShowInfo] = useState(false);

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

	const handleInfoToggle = () => {
		setShowInfo(!showInfo);
	};

	return (
		<Modal isOpen={isOpen} size="xl" isCentered onClose={() => null}>
			<ModalOverlay />
			<ModalContent py="5">
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)}>
						<ModalHeader borderBottomWidth="1px">
							Get access to betas and help us improve Dropbase!
						</ModalHeader>
						<ModalBody py="6">
							<Stack spacing="3">
								<Stack direction="row">
									<FormInput
										name="Email *"
										id="email"
										type="email"
										validation={{
											required: 'Email is required',
										}}
									/>
									<FormInput name="Company" id="company" />
								</Stack>

								<Stack direction="row">
									<FormInput
										name="First Name *"
										id="first_name"
										validation={{
											required: 'First name is required',
										}}
									/>
									<FormInput
										name="Last Name *"
										id="last_name"
										validation={{
											required: 'Last name is required',
										}}
									/>
								</Stack>

								<FormInput
									name="What are you looking to use Dropbase for? (user case)"
									id="use_case"
									type="textarea"
								/>
							</Stack>
							<Stack align="center" pt="5">
								<Button
									width="100px"
									colorScheme="blue"
									isLoading={onboardLoading}
									type="submit"
									size="sm"
								>
									Complete
								</Button>
							</Stack>
						</ModalBody>
						<ModalFooter borderTopWidth="1px">
							<Stack direction="column" spacing="3" width="full">
								<Text
									textDecoration="underline"
									cursor="pointer"
									fontSize="sm"
									onClick={() => handleInfoToggle()}
								>
									What happens when I complete this form?
								</Text>
								<Stack display={showInfo ? 'contents' : 'none'}>
									<OrderedList fontSize="sm">
										<ListItem>
											Local setup is completed. The workspace's
											properties.json file is updated with owner information,
											and this form will not be prompted again.
										</ListItem>
										<ListItem>
											Your contact info is added to our mailing list so we can
											send you updates, beta invites, and access to
											Slack/Discord, etc.
										</ListItem>
										<ListItem>
											Your feedback is sent to our Slack channel.
										</ListItem>
									</OrderedList>
								</Stack>
							</Stack>
						</ModalFooter>
					</form>
				</FormProvider>
			</ModalContent>
		</Modal>
	);
};
