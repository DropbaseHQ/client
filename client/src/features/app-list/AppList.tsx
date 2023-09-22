import {
	Stack,
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
	Skeleton,
	SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'react-feather';

import { useState } from 'react';

import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useCreateApp } from './hooks/useCreateApp';
import { PageLayout } from '@/layout';

const AppCard = ({ app }: { app: AppType }) => {
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(`/apps/${app.id}/${app?.pages?.[0]?.id}/new-editor`);
	};
	return (
		<Stack
			borderWidth="1px"
			borderColor="gray.200"
			bg="white"
			borderRadius="md"
			alignItems="center"
			direction="row"
			cursor="pointer"
			p="4"
			spacing="4"
			transition="all ease .2s"
			_hover={{
				shadow: 'xs',
				borderColor: 'gray.300',
			}}
			onClick={handleClick}
		>
			<Layout strokeWidth="1.5px" size="40px" />
			<Stack spacing="0">
				<Text fontSize="lg" fontWeight="semibold">
					{app?.name}
				</Text>
			</Stack>
		</Stack>
	);
};

export const AppList = () => {
	// Will need to pass workspace in here but for now we only have one workspace (backend spits out the first workspace)
	const navigate = useNavigate();
	const { apps, refetch, isLoading } = useGetWorkspaceApps();
	const [appName, setAppName] = useState('');
	const { isOpen, onOpen, onClose } = useDisclosure();
	const createAppMutation = useCreateApp({
		onSuccess: (data: any) => {
			navigate(`/apps/${data.app?.id}/${data?.page?.id}/new-editor`);
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
		<PageLayout
			title="Your apps"
			action={
				<Button size="sm" ml="auto" onClick={onOpen}>
					Create app
				</Button>
			}
		>
			<SimpleGrid spacing={6} columns={4}>
				{isLoading ? (
					<>
						<Skeleton w="full" h={24} />
						<Skeleton w="full" h={24} />
						<Skeleton w="full" h={24} />
						<Skeleton w="full" h={24} />
					</>
				) : (
					apps.map((app) => <AppCard key={app.id} app={app} />)
				)}
			</SimpleGrid>
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
		</PageLayout>
	);
};
