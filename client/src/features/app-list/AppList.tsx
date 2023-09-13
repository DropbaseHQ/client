import {
	Box,
	Stack,
	Heading,
	Grid,
	Flex,
	Text,
	Button,
	Input,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { AppGraphic } from './AppGraphic';
import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useCreateApp } from './hooks/useCreateApp';

const AppCard = ({ app }: { app: AppType }) => {
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(`/apps/${app.id}/${app?.pages?.[0]?.id}/new-editor`);
	};
	return (
		<Flex
			rounded="md"
			borderWidth="1px"
			borderColor="gray.200"
			borderRadius="md"
			alignItems="center"
			justifyContent="space-around"
			cursor="pointer"
			p="2"
			_hover={{
				bg: 'gray.100',
			}}
			onClick={handleClick}
		>
			<Flex flex="1" alignItems="center" justifyContent="cente">
				<AppGraphic />
			</Flex>
			<Box flex="2">
				<Heading size="xs">{app?.name}</Heading>
				<Text>Lorem ipsum</Text>
			</Box>
		</Flex>
	);
};

export const AppList = () => {
	// Will need to pass workspace in here but for now we only have one workspace (backend spits out the first workspace)
	const { apps, refetch } = useGetWorkspaceApps();
	const [appName, setAppName] = useState('');
	const { isOpen, onOpen, onClose } = useDisclosure();
	const createAppMutation = useCreateApp({
		onSuccess: () => {
			refetch();
			setAppName('');
			onClose();
		},
	});

	const handleCreateApp = async () => {
		await createAppMutation.mutateAsync({
			name: appName,
		});
	};

	return (
		<>
			<Stack>
				{/* <AppBuilderNavbar /> */}
				<Box h="full" p="4">
					<Flex w="full" justifyContent="space-between">
						<Heading size="md" mb="8">
							Your apps
						</Heading>
						<Button onClick={onOpen}>Add app</Button>
					</Flex>

					<Grid templateColumns="repeat(3, 1fr)" gap={6}>
						{apps.map((app) => (
							<AppCard key={app.id} app={app} />
						))}
					</Grid>
				</Box>
			</Stack>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create a new app</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Input
							placeholder="App name"
							value={appName}
							onChange={(e) => {
								setAppName(e.target.value);
							}}
						/>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							isLoading={createAppMutation.isLoading}
							onClick={handleCreateApp}
						>
							Create
						</Button>
						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
