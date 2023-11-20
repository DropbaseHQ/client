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
	useToast,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Layout, MoreVertical, Trash } from 'react-feather';
import { useAtomValue } from 'jotai';

import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useCreateAppFlow } from './hooks/useCreateApp';
import { PageLayout } from '@/layout';
import { FormInput } from '@/components/FormInput';
import { useDeleteApp } from '@/features/app-list/hooks/useDeleteApp';
import { workspaceAtom } from '@/features/workspaces';

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
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
			});
		},
	});

	const handleClick = () => {
		navigate(`/apps/${app.id}/${app?.pages?.[0]?.id}/preview`);
	};

	const onSubmit = () => {
		if (app.id) {
			deleteMutation.mutate({
				appId: app.id,
				appName: app.name,
			});
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
					onClick={(e) => {
						e.stopPropagation();
					}}
				/>

				<MenuList>
					<MenuItem
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
								Confirm App deletion
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody py="6">
								<FormInput
									name="App name"
									id="name"
									placeholder={`Write ${app.name} to delete`}
									validation={{
										validate: (value: any) =>
											value === app.name || 'App name didnt match',
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
	const workspaceId = useAtomValue(workspaceAtom);

	const methods = useForm();

	const { apps, refetch, isLoading } = useGetWorkspaceApps();
	const { isOpen, onOpen, onClose } = useDisclosure({
		onClose: () => {
			methods.reset();
		},
	});

	const { handleCreateApp: handleCreateAppFlow, isLoading: createAppIsLoading } =
		useCreateAppFlow({
			onSuccess: (_: any, variables: any) => {
				if (variables?.appTemplate?.page?.id) {
					navigate(
						`/apps/${variables?.appId}/${variables?.appTemplate?.page?.id}/editor`,
					);
				}
				refetch();
				onClose();
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
			workspaceId: workspaceId || '',
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
