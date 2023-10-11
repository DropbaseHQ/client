import { useEffect, useState } from 'react';
import { PageLayout } from '@/layout';
import { Trash } from 'react-feather';
import {
	Input,
	Button,
	IconButton,
	Box,
	Text,
	VStack,
	Flex,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	Switch,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	PopoverAnchor,
	ButtonGroup,
} from '@chakra-ui/react';
import { useCreateGroup } from './hooks/useCreateGroup';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';
import {
	useGetWorkspaceGroups,
	GET_WORKSPACE_GROUPS_QUERY_KEY,
} from './hooks/useGetWorkspaceGroups';
import { useQueryClient } from 'react-query';
import { useGetWorkspaceApps, App } from '../app-list/hooks/useGetWorkspaceApps';
import { useUpdateGroupPolicy } from './hooks/useUpdateGroupPolicy';
import { useGetGroup } from './hooks/useGetGroup';
import { useDeleteGroup } from './hooks/useDeleteGroup';

const PolicyToggle = ({
	groupId,
	appId,
	action,
}: {
	groupId: string;
	appId: string;
	action: string;
}) => {
	const [isChecked, setIsChecked] = useState(false);
	const updateGroupPolicyMutation = useUpdateGroupPolicy();
	const { permissions } = useGetGroup({ groupId });
	const policy = permissions?.find((item) => item.resource === appId && item.action === action);

	useEffect(() => {
		setIsChecked(policy ? true : false);
	}, [policy]);

	const handleToggle = () => {
		setIsChecked(!isChecked);
		updateGroupPolicyMutation.mutate({
			groupId,
			resource: appId,
			action,
			effect: isChecked ? 'deny' : 'allow',
		});
	};

	return <Switch isChecked={isChecked} onChange={handleToggle} size="md" colorScheme="blue" />;
};

const PolicyTable = ({ selectedGroup, apps }: { selectedGroup: string; apps: App[] }) => {
	return (
		<Box flexGrow="4" ml="8">
			{selectedGroup && (
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>App</Th>
							<Th>Use</Th>
							<Th>Edit</Th>
							<Th>Own</Th>
						</Tr>
					</Thead>
					<Tbody>
						{apps.map((app: any) => (
							<Tr key={app.id}>
								<Td>{app.name}</Td>
								<Td>
									<PolicyToggle
										groupId={selectedGroup}
										appId={app.id}
										action="use"
									/>
								</Td>
								<Td>
									<PolicyToggle
										groupId={selectedGroup}
										appId={app.id}
										action="edit"
									/>
								</Td>
								<Td>
									<PolicyToggle
										groupId={selectedGroup}
										appId={app.id}
										action="own"
									/>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			)}
		</Box>
	);
};

const GroupCard = ({
	selectedGroup,
	setSelectedGroup,
	group,
}: {
	selectedGroup: string;
	setSelectedGroup: any;
	group: any;
}) => {
	const [isDeletePopoverOpen, setDeletePopoverOpen] = useState(false);
	const queryClient = useQueryClient();
	const deleteGroupMutation = useDeleteGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
		},
	});

	const openDeletePopover = () => {
		setDeletePopoverOpen(true);
	};

	// Function to close the delete popover
	const closeDeletePopover = () => {
		setDeletePopoverOpen(false);
	};

	const handleDeleteGroup = () => {
		deleteGroupMutation.mutate({
			groupId: group.id,
		});
	};
	return (
		<Box
			key={group.id}
			p={3}
			borderWidth="2px"
			borderRadius="lg"
			boxShadow={selectedGroup === group.id ? 'sm' : 'md'}
			_hover={{ cursor: 'pointer' }}
			borderColor={selectedGroup === group.id ? 'blue.500' : 'gray.200'}
			onClick={() => setSelectedGroup(group.id)}
			display="flex"
			justifyContent="space-between"
		>
			<Text fontSize="xl" fontWeight="bold">
				{group.name}
			</Text>
			<Popover
				returnFocusOnClose={false}
				isOpen={isDeletePopoverOpen}
				onClose={closeDeletePopover}
				placement="right"
				closeOnBlur={false}
			>
				<PopoverTrigger>
					<IconButton
						aria-label="Delete Group"
						size="xs"
						icon={<Trash size="12" />}
						bgColor="red"
						onClick={openDeletePopover}
					/>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader>Confirm Delete</PopoverHeader>
					<PopoverBody>Are you sure you want to delete this group?</PopoverBody>
					<PopoverFooter display="flex" justifyContent="flex-end">
						<ButtonGroup>
							<Button
								colorScheme="red"
								size="sm"
								onClick={handleDeleteGroup}
								isLoading={deleteGroupMutation.isLoading}
							>
								Delete
							</Button>
							<Button variant="ghost" size="sm" onClick={closeDeletePopover}>
								Cancel
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		</Box>
	);
};

export const Groups = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();
	const {
		isOpen: createGroupIsOpen,
		onOpen: createGroupOnOpen,
		onClose: createGroupOnClose,
	} = useDisclosure();

	const { groups } = useGetWorkspaceGroups({ workspaceId: workspaceId || '' });
	const { apps } = useGetWorkspaceApps();
	const createGroupMutation = useCreateGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
			createGroupOnClose();
		},
	});

	const [selectedGroup, setSelectedGroup] = useState('' as string);
	const [newGroupName, setNewGroupName] = useState('' as string);

	const handleCreateGroup = () => {
		createGroupMutation.mutate({
			workspaceId: workspaceId || '',
			name: newGroupName,
		});
	};

	return (
		<PageLayout
			title="Group Manager"
			action={
				<Button size="sm" ml="auto" onClick={createGroupOnOpen}>
					Create Group
				</Button>
			}
		>
			<Flex h="100%" justifyContent="space-between">
				<Flex direction="column" flex="1">
					<VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
						{groups?.map((group: any) => (
							<GroupCard
								key={group.id}
								selectedGroup={selectedGroup}
								setSelectedGroup={setSelectedGroup}
								group={group}
							/>
						))}
					</VStack>
				</Flex>
				<PolicyTable selectedGroup={selectedGroup} apps={apps} />
			</Flex>
			<Modal isOpen={createGroupIsOpen} onClose={createGroupOnClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create a new group</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Input
							placeholder="Group name"
							value={newGroupName}
							onChange={(e) => {
								setNewGroupName(e.target.value);
							}}
						/>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							onClick={handleCreateGroup}
							isLoading={createGroupMutation.isLoading}
						>
							Create
						</Button>
						<Button variant="ghost" onClick={createGroupOnClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</PageLayout>
	);
};
