import { useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { workspaceAtom } from '@/features/workspaces';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	Button,
	Input,
	InputGroup,
	InputLeftAddon,
	Stack,
	Link,
	ModalCloseButton,
	FormControl,
	FormLabel,
} from '@chakra-ui/react';
import { useSendCloudRequest } from './hooks/useSendCloudRequest';
import { integer } from 'vscode-languageclient';

interface FormInput {
	userNum: integer;
	workerURL: string;
}
export const SalesModal = ({ isOpen, setIsOpen }: any) => {
	const methods = useForm<FormInput>();
	const workspace = useAtomValue(workspaceAtom);
	const upgradeMutation = useSendCloudRequest();

	const onSubmit = (data: FormInput) => {
		upgradeMutation.mutate({
			workspaceId: workspace,
			userNum: data.userNum,
			workerURL: data.workerURL,
		});
	};
	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				setIsOpen(false);
			}}
			size="xl"
		>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Upgrade to access the Dropbase hosted client</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<p>
						Fill out this form and we'll get back to you with a quote for your team
						size. Or contact us at{' '}
						<Link href="mailto:support@dropbase.io" target="_blank">
							support@dropbase.io.
						</Link>{' '}
					</p>
					<br />

					<Stack>
						To access the Dropbase hosted client, please fill out this form
						<FormControl>
							<FormLabel>Number of users</FormLabel>
							<Input {...methods.register('userNum')} borderRadius="md" />
						</FormControl>
						<FormControl>
							<FormLabel>Worker URL</FormLabel>
							<InputGroup>
								<InputLeftAddon children="http://" />
								<Input {...methods.register('workerURL')} borderRadius="md" />
							</InputGroup>
						</FormControl>
					</Stack>
				</ModalBody>
				<ModalFooter borderTopWidth="1px">
					{upgradeMutation.isSuccess ? (
						<Button colorScheme="green" size="sm" isDisabled>
							Sent!
						</Button>
					) : (
						<Button
							onClick={methods.handleSubmit(onSubmit)}
							isLoading={upgradeMutation.isLoading}
							colorScheme="blue"
							type="submit"
							size="sm"
						>
							Send Request
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
