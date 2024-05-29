import {
	Badge,
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
	Tooltip,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Layout, MoreVertical, Trash, PlusCircle } from 'react-feather';
import { useEffect } from 'react';
import { useStatus } from '@/layout/StatusBar';
import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useCreateAppFlow } from './hooks/useCreateApp';
import { PageLayout } from '@/layout';
import { FormInput } from '@/components/FormInput';
import { useDeleteApp } from '@/features/app-list/hooks/useDeleteApp';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useSyncApp } from './hooks/useSyncApp';

const AppCard = ({ app }: { app: AppType }) => {
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const methods = useForm();
	const navigate = useNavigate();
	const syncAppMutation = useSyncApp({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'App synced',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to sync app',
				description: getErrorMessage(error),
			});
		},
	});

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
	const handleSyncApp = (generateNew: boolean) => {
		syncAppMutation.mutate({ appName: app.name, generateNew });
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
			<Text fontSize="lg" fontWeight="semibold" isTruncated flex="1">
				{app?.label}
			</Text>
			{app?.status === 'ID_NOT_FOUND_AND_NAME_NOT_FOUND' && (
				<Tooltip
					placement="top"
					label="This app has no ID. This means that this app will not work because Dropbase will not be able to identify it. This may have happened if you changed the workspace folder manually."
				>
					<Badge colorScheme="red" variant="subtle" size="xs">
						No ID Found
					</Badge>
				</Tooltip>
			)}
			{app?.status === 'ID_NOT_FOUND_BUT_NAME_FOUND' && (
				<Tooltip
					placement="top"
					label="This app has no ID. However, we found an app with a matching name in our Database that belongs to your workspace. You have the option of syncing your app with the one that we found. Do note that we cannot guarantee that the app we found is the same as the one in your workspace. This may have happened if you changed the workspace folder manually."
				>
					<Badge colorScheme="orange" variant="subtle" size="xs">
						No ID Found But Name Found
					</Badge>
				</Tooltip>
			)}
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
						<Stack alignItems="center" direction="row" fontSize="md">
							<Trash size="14" />
							<Box>Delete App</Box>
						</Stack>
					</MenuItem>

					{app?.status === 'ID_NOT_FOUND_BUT_NAME_FOUND' && (
						<MenuItem
							onClick={(e) => {
								e.stopPropagation();
								handleSyncApp(false);
							}}
						>
							<Stack alignItems="center" direction="row" fontSize="md">
								<PlusCircle size="14" />
								<Box>Sync an Existing App</Box>
							</Stack>
						</MenuItem>
					)}
				</MenuList>
			</Menu>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<ModalHeader fontSize="md" borderBottomWidth="1px">
								Confirm deletion of {app.label}
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody py="6">
								<Text fontSize="sm" mb="2">
									Write{' '}
									<span
										style={{
											backgroundColor: '#eee',
											padding: '.1em .3em',
											borderRadius: '.2em',
											fontStyle: 'italic',
										}}
									>
										{app.name}
									</span>{' '}
									to delete the app
								</Text>
								<FormInput
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
	const { status, isLoading: isCheckingStatus } = useStatus();
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
	const generateAppName = (label: string) => {
		let formattedLabel = label
			?.toLowerCase()
			.replace(/[^a-z0-9]/g, '_')
			.replace(/_{2,}/g, '_')
			.replace(/^_+|_+$/g, '');

		if (formattedLabel?.match(/^\d/)) {
			formattedLabel = `_${formattedLabel}`;
		}
		return formattedLabel;
	};

	const onSubmit = async ({ name: appName, label: appLabel }: any) => {
		await handleCreateAppFlow({
			name: appName,
			label: appLabel,
		});
	};
	const appLabel = methods.watch('label');

	useEffect(() => {
		if (!methods.formState.dirtyFields.name) {
			methods.setValue('name', generateAppName(appLabel));
		}
	}, [methods, appLabel]);

	const workerIsConnected = status === 'success';

	if (isCheckingStatus || isLoading) {
		return (
			<PageLayout title="Your apps">
				<SimpleGrid spacing={6} pb="4" columns={4}>
					<Skeleton w="full" h={24} />
					<Skeleton w="full" h={24} />
					<Skeleton w="full" h={24} />
					<Skeleton w="full" h={24} />
				</SimpleGrid>
			</PageLayout>
		);
	}

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
					{apps
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((app) => (
							<AppCard key={app.name} app={app} />
						))}
				</SimpleGrid>
			) : (
				<Text fontSize="lg" fontWeight="bold">
					Please connect to a worker to view and create apps.
				</Text>
			)}

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
								<Stack spacing="2">
									<FormInput
										name="App label"
										id="label"
										placeholder="Enter app label"
										data-cy="app-name"
									/>
									<FormInput
										name="App name"
										id="name"
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
								</Stack>
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
