import {
	Stack,
	Text,
	Button,
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
	Menu,
	MenuButton,
	MenuList,
	Box,
	MenuItem,
	IconButton,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Layout, MoreVertical, Trash } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useStatus } from '@/layout/StatusBar';
import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useCreateAppFlow } from './hooks/useCreateApp';
import { PageLayout } from '@/layout';
import { FormInput } from '@/components/FormInput';
import { useDeleteApp } from '@/features/app-list/hooks/useDeleteApp';
import { useWorkspaces, workspaceAtom } from '@/features/workspaces';
import { SalesModal } from './AppSalesModal';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

const AppCard = ({ app }: { app: AppType }) => {
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const methods = useForm();
	const navigate = useNavigate();

	const deleteMutation = useDeleteApp({
		onSuccess: () => {
			onClose();
			toast({
				status: 'success',
				title: 'App deleted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete app',
				description: getErrorMessage(error),
			});
		},
	});

	const handleClick = () => {
		navigate(`/apps/${app.name}/${app?.pages?.[0]?.name}`);
	};

	const onSubmit = () => {
		if (app.name) {
			deleteMutation.mutate(app.name);
		}
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
			data-cy={`app-card-${app.name}`}
		>
			<Layout strokeWidth="1.5px" size="40px" />
			<Stack spacing="0">
				<Text fontSize="lg" fontWeight="semibold">
					{app?.name}
				</Text>
			</Stack>
			<Menu>
				<MenuButton
					flexShrink="0"
					as={IconButton}
					minW="none"
					p="1"
					h={8}
					variant="ghost"
					colorScheme="gray"
					minH="none"
					icon={<MoreVertical size="14" />}
					ml="auto"
					data-cy={`app-menu-${app.name}`}
					onClick={(e) => {
						e.stopPropagation();
					}}
				/>

				<MenuList>
					<MenuItem
						data-cy={`delete-app-${app.name}`}
						color="red"
						onClick={(e) => {
							e.stopPropagation();
							onOpen();
						}}
					>
						<Stack alignItems="center" direction="row">
							<Trash size="14" />
							<Box>Delete App</Box>
						</Stack>
					</MenuItem>
				</MenuList>
			</Menu>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<ModalHeader fontSize="md" borderBottomWidth="1px">
								Confirm app deletion
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody py="6">
								<FormInput
									name={`Write ${app.name} to delete the app`}
									autoFocus
									id="name"
									data-cy={`confirm-delete-app-input-${app.name}`}
									placeholder={app.name}
									validation={{
										validate: (value: any) =>
											value === app.name || 'App name did not match',
									}}
								/>
							</ModalBody>
							<ModalFooter borderTopWidth="1px">
								<Button
									size="sm"
									colorScheme="gray"
									mr={3}
									variant="ghost"
									disabled={deleteMutation.isLoading}
									onClick={onClose}
								>
									Close
								</Button>
								<Button
									isLoading={deleteMutation.isLoading}
									type="submit"
									size="sm"
									colorScheme="red"
									data-cy={`confirm-delete-app-${app.name}`}
								>
									Delete
								</Button>
							</ModalFooter>
						</form>
					</FormProvider>
				</ModalContent>
			</Modal>
		</Stack>
	);
};

export const AppList = () => {
	const navigate = useNavigate();
	const toast = useToast();
	const workspaceId = useAtomValue(workspaceAtom);
	const { workspaces } = useWorkspaces();
	const { status } = useStatus();
	const methods = useForm();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);

	const { apps, refetch, isLoading } = useGetWorkspaceApps();
	const { isOpen, onOpen, onClose } = useDisclosure({
		onClose: () => {
			methods.reset();
		},
	});

	const { handleCreateApp: handleCreateAppFlow, isLoading: createAppIsLoading } =
		useCreateAppFlow({
			onSuccess: (_: any, variables: any) => {
				refetch();

				onClose();
				navigate(`/apps/${variables?.appName}/page1/studio`);
			},
			onError: (error: any) => {
				toast({
					status: 'error',
					title: 'Failed to create app',
					description: getErrorMessage(error),
				});
			},
		});

	const nameNotUnique = (newName: any) => {
		return apps.find((a) => {
			return a.name === newName;
		});
	};

	const onSubmit = async ({ name: appName }: any) => {
		await handleCreateAppFlow({
			name: appName,
			workspaceId: workspaceId as string,
		});
	};

	const workerIsConnected = status === 'success';
	const workspaceHasWorkspaceURL = !!currentWorkspace?.workspaceUrl;
	const isDeployed = window.location.hostname.endsWith('dropbase.io');

	const shouldDisplaySalesModal = isDeployed
		? !workspaceHasWorkspaceURL && !workerIsConnected
		: false;
	return (
		<PageLayout
			title="Your apps"
			action={
				<Button
					size="sm"
					ml="auto"
					onClick={onOpen}
					isDisabled={!workerIsConnected}
					data-cy="create-app-button"
				>
					Create app
				</Button>
			}
		>
			{workerIsConnected ? (
				<SimpleGrid spacing={6} pb="4" columns={4}>
					{isLoading ? (
						<>
							<Skeleton w="full" h={24} />
							<Skeleton w="full" h={24} />
							<Skeleton w="full" h={24} />
							<Skeleton w="full" h={24} />
						</>
					) : (
						apps
							.sort((a, b) => a.name.localeCompare(b.name))
							.map((app) => <AppCard key={app.id} app={app} />)
					)}
				</SimpleGrid>
			) : (
				<Text fontSize="lg" fontWeight="bold">
					Please connect to a worker to view and create apps.
				</Text>
			)}
			{shouldDisplaySalesModal && <SalesModal />}

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<ModalHeader fontSize="md" borderBottomWidth="1px">
								Create a new app
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody py="6">
								<FormInput
									name="App name"
									id="name"
									data-cy="app-name"
									placeholder="Enter app name"
									validation={{
										validate: (value: any) => {
											if (value.includes(' ')) {
												return 'Name cannot have spaces';
											}
											if (!value) {
												return 'Name required';
											}
											if (nameNotUnique(value)) {
												return 'Name already exists';
											}
											if (!value.match(/^[A-Za-z0-9_.]+$/g)) {
												return 'Name contains invalid characters';
											}

											return true;
										},
									}}
								/>
							</ModalBody>
							<ModalFooter borderTopWidth="1px">
								<Button
									size="sm"
									colorScheme="gray"
									mr={3}
									variant="ghost"
									disabled={createAppIsLoading}
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button
									colorScheme="blue"
									isLoading={createAppIsLoading}
									type="submit"
									size="sm"
									data-cy="confirm-create-app"
								>
									Create
								</Button>
							</ModalFooter>
						</form>
					</FormProvider>
				</ModalContent>
			</Modal>
		</PageLayout>
	);
};
