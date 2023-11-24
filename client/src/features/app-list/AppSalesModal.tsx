import { useState } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	Link,
	ModalCloseButton,
	ListItem,
	UnorderedList,
} from '@chakra-ui/react';

export const SalesModal = () => {
	const [isOpen, setIsOpen] = useState(true);
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
						We're excited to chat with you about Dropbase and how we can help you with
						your data needs.
					</p>
					<br />

					<p>
						To access the Dropbase hosted client, email us at{' '}
						<Link href="mailto:support@dropbase.io" target="_blank">
							support@dropbase.io.
						</Link>{' '}
						<br />
						<br />
						Please let us know:
						<UnorderedList>
							<ListItem> How many users you'd like to have</ListItem>
							<ListItem> Your worker URL</ListItem>
						</UnorderedList>
					</p>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
