import {
	Box,
	Circle,
	Icon,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Download, Mail, Tool } from 'react-feather';
import { useStatus } from '@/layout/StatusBar';

const data = [
	{
		title: 'Make sure you have the Dropbase Worker set up.',
		icon: Download,
		link: 'https://docs.dropbase.io/setup/developer',
		showDocs: true,
		id: 'setup',
	},
	{
		title: `If you've set up the Dropbase Worker, see troubleshooting guide.`,
		icon: Tool,
		link: 'https://docs.dropbase.io/how-to-guides/troubleshoot-worker',
		showDocs: true,
		id: 'troubleshoot',
	},
	{
		title: (
			<>
				<Box as="span">Still having issues? Contact Support:</Box>
				<Link
					display="inline"
					href="mailto:support@driobase.io"
					target="_blank"
					rel="noreferrer noopener"
					isExternal
					mx="2"
				>
					support@dropbase.io
				</Link>
			</>
		),
		icon: Mail,
		id: 'support',
	},
];

export const WorkerDisconnected = () => {
	const { isConnected, isLoading } = useStatus();

	if (isConnected || isLoading) {
		return null;
	}

	return (
		<Modal isCentered size="xl" isOpen onClose={() => {}}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader borderBottomWidth="1px">
					<Stack spacing="0">
						<Text fontSize="xl">Worker is not connected</Text>
						<Text fontSize="sm" color="gray.700" fontWeight="medium">
							We could not make a connection to your Worker server.
						</Text>
					</Stack>
				</ModalHeader>
				<ModalBody>
					<Stack spacing={4}>
						<Stack spacing={3}>
							{data.map((d) => (
								<Stack key={d.id} alignItems="center" direction="row">
									<Circle borderWidth="1px" size={8}>
										<Icon as={d.icon} size="6" color="blue.500" />
									</Circle>
									<Text>
										<Box as="span">{d.title}</Box>
										{d.showDocs ? (
											<Link
												display="inline"
												href={d.link}
												target="_blank"
												rel="noreferrer noopener"
												isExternal
												mx="1"
											>
												Docs
											</Link>
										) : null}
									</Text>
								</Stack>
							))}
						</Stack>
					</Stack>
					<ModalFooter />
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
