import { useState } from 'react';
import { PageLayout } from '@/layout';
import {
	Input,
	Button,
	Box,
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
	ButtonGroup,
	Text,
	Tag,
	IconButton,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	Select,
} from '@chakra-ui/react';
import { useCreateGroup } from './hooks/group';
import { workspaceAtom } from '@/features/workspaces';
import { UserPlus, UserMinus } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useGetWorkspaceGroups, GET_WORKSPACE_GROUPS_QUERY_KEY } from './hooks/workspace';
import { useAddUserToGroup } from './hooks/group';
import { useQueryClient } from 'react-query';
import { useGetWorkspaceApps, App } from '../app-list/hooks/useGetWorkspaceApps';
import { UserPolicySelector, GroupPolicySelector } from './components/PolicySelector';
import { GroupCard } from './Group';
import { UserCard } from './Users';
import { PermissionsCard } from './components/EntityCard/EntityCard';
import { useGetWorkspaceUsers } from './hooks/workspace';
import { useGetGroupUsers } from './hooks/group';
import { useRemoveUserFromGroup } from './hooks/group';

const PolicyTable = ({
	selectedResourceId,
	apps,
	resourceType,
}: {
	selectedResourceId: string;
	apps: App[];
	resourceType: string;
}) => {
	const getSelector = (selectedResourceId: string, appId: string) => {
		if (resourceType === 'users') {
			return <UserPolicySelector userId={selectedResourceId} appId={appId} />;
		}

		return <GroupPolicySelector groupId={selectedResourceId} appId={appId} />;
	};
	return (
		<Box flexGrow="4" ml="8">
			{selectedResourceId && (
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>App</Th>
							<Th>Permission Level</Th>
						</Tr>
					</Thead>
					<Tbody>
						{apps.map((app: any) => (
							<Tr key={app.id}>
								<Td>{app.name}</Td>
								<Td>{getSelector(selectedResourceId, app.id)}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			)}
		</Box>
	);
};

const GroupMemberCard = ({
	user,
	selectedGroup,
	refetchGroupUsers,
}: {
	user: any;
	selectedGroup: string;
	refetchGroupUsers: () => void;
}) => {
	const {
		isOpen: removeMemberIsOpen,
		onOpen: removeMemberOnOpen,
		onClose: removeMemberOnClose,
	} = useDisclosure();

	const removeUserFromGroupMutation = useRemoveUserFromGroup({
		onSuccess: () => {
			refetchGroupUsers();
			removeMemberOnClose();
		},
	});

	const handleRemoveUserFromGroup = () => {
		removeUserFromGroupMutation.mutate({
			userId: user.id,
			groupId: selectedGroup,
		});
	};

	return (
		<PermissionsCard entity={user} key={user.id}>
			<Flex justifyContent="space-between" w="full">
				<Flex alignItems="center">
					<Text>{user.email}</Text>
					{user.role === 'leader' && <Tag ml="2">Leader</Tag>}
				</Flex>
				<Popover
					isOpen={removeMemberIsOpen}
					onClose={removeMemberOnClose}
					onOpen={removeMemberOnOpen}
					placement="right"
				>
					<PopoverTrigger>
						<IconButton
							aria-label="Remove user from group"
							size="xs"
							icon={<UserMinus size="14" />}
							bgColor="red"
						/>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverArrow />
						<PopoverCloseButton />
						<PopoverHeader>Confirm remove member</PopoverHeader>
						<PopoverBody>
							<Text>{`Are you sure you want to\nremove ${user.email}?`}</Text>
						</PopoverBody>
						<PopoverFooter display="flex" justifyContent="flex-end">
							<ButtonGroup size="sm">
								<Button
									colorScheme="blue"
									onClick={handleRemoveUserFromGroup}
									isLoading={removeUserFromGroupMutation.isLoading}
								>
									Remove
								</Button>
								<Button variant="outline" onClick={removeMemberOnClose}>
									Cancel
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</PopoverContent>
				</Popover>
			</Flex>
		</PermissionsCard>
	);
};

export const Permissions = () => {
	const [selectedGroup, setSelectedGroup] = useState('' as string);
	const [selectedUser, setSelectedUser] = useState('' as string);
	const [newGroupName, setNewGroupName] = useState('' as string);
	const [resourceType, setResourceType] = useState('groups' as string);
	const [invitedMember, setInviteMember] = useState('' as string);

	const workspaceId = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();
	const {
		isOpen: createGroupIsOpen,
		onOpen: createGroupOnOpen,
		onClose: createGroupOnClose,
	} = useDisclosure();

	const {
		isOpen: inviteMemberIsOpen,
		onOpen: inviteMemberOnOpen,
		onClose: inviteMemberOnClose,
	} = useDisclosure();

	const { groups } = useGetWorkspaceGroups();
	const { users } = useGetWorkspaceUsers();
	const { apps } = useGetWorkspaceApps();
	const { users: groupUsers, refetch: refetchGroupUsers } = useGetGroupUsers({
		groupId: selectedGroup,
	});
	const createGroupMutation = useCreateGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
			createGroupOnClose();
		},
	});
	const addUserToGroupMutation = useAddUserToGroup({
		onSuccess: () => {
			refetchGroupUsers();
			inviteMemberOnClose();
		},
	});

	const setResourceTypeToGroups = () => {
		setResourceType('groups');
	};
	const setResourceTypeToUsers = () => {
		setResourceType('users');
	};

	const handleCreateGroup = () => {
		createGroupMutation.mutate({
			workspaceId: workspaceId || '',
			name: newGroupName,
		});
		createGroupOnClose();
	};
	const handleAddUserToGroup = () => {
		addUserToGroupMutation.mutate({
			userId: invitedMember,
			groupId: selectedGroup,
		});
		inviteMemberOnClose();
	};

	return (
		<PageLayout
			title="Permissions Manager"
			action={
				<Button size="sm" ml="auto" onClick={createGroupOnOpen}>
					Create Group
				</Button>
			}
		>
			<Flex h="100%" justifyContent="space-between">
				<Flex direction="column" flex="2">
					<ButtonGroup size="xs" mb="4" isAttached>
						<Button
							flexGrow="1"
							variant={resourceType === 'groups' ? 'solid' : 'outline'}
							onClick={setResourceTypeToGroups}
						>
							Groups
						</Button>
						<Button
							flexGrow="1"
							variant={resourceType === 'users' ? 'solid' : 'outline'}
							onClick={setResourceTypeToUsers}
						>
							Users
						</Button>
					</ButtonGroup>
					<VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
						{resourceType === 'groups' &&
							groups?.map((group: any) => (
								<GroupCard
									key={group.id}
									selectedGroup={selectedGroup}
									setSelectedGroup={setSelectedGroup}
									group={group}
								/>
							))}
						{resourceType === 'users' &&
							users?.map((user: any) => (
								<UserCard
									key={user.id}
									selectedUser={selectedUser}
									setSelectedUser={setSelectedUser}
									user={user}
								/>
							))}
					</VStack>
				</Flex>
				{resourceType === 'groups' && !!selectedGroup ? (
					<Flex direction="column" ml="6" flex="2">
						<Flex justifyContent="space-between">
							<Text as="b">Members</Text>
							<Popover
								isOpen={inviteMemberIsOpen}
								onClose={inviteMemberOnClose}
								onOpen={inviteMemberOnOpen}
								placement="bottom"
							>
								<PopoverTrigger>
									<IconButton
										size="xs"
										aria-label="Add group member"
										icon={<UserPlus size="14" />}
									/>
								</PopoverTrigger>
								<PopoverContent>
									<PopoverArrow />
									<PopoverCloseButton />
									<PopoverHeader>Add a member to this group!</PopoverHeader>
									<PopoverBody>
										<Select
											placeholder="Select a member to invite"
											value={invitedMember}
											onChange={(e) => setInviteMember(e.target.value)}
										>
											{users
												?.filter(
													(user: any) =>
														!groupUsers.some(
															(groupUser) => groupUser.id === user.id,
														),
												)
												.map((user: any) => (
													<option value={user.id}>{user.email}</option>
												))}
										</Select>
									</PopoverBody>
									<PopoverFooter display="flex" justifyContent="flex-end">
										<ButtonGroup size="sm">
											<Button
												colorScheme="blue"
												onClick={handleAddUserToGroup}
												isLoading={addUserToGroupMutation.isLoading}
											>
												Add
											</Button>
											<Button variant="outline" onClick={inviteMemberOnClose}>
												Cancel
											</Button>
										</ButtonGroup>
									</PopoverFooter>
								</PopoverContent>
							</Popover>
						</Flex>
						<Box flexGrow="1" mt="4">
							<VStack
								spacing={4}
								align="stretch"
								maxH="400px"
								overflowY="auto"
								width="full"
							>
								{resourceType === 'groups' &&
									groupUsers?.map((user: any) => (
										<GroupMemberCard
											user={user}
											selectedGroup={selectedGroup}
											refetchGroupUsers={refetchGroupUsers}
											key={user.id}
										/>
									))}
							</VStack>
						</Box>
					</Flex>
				) : null}

				<PolicyTable
					selectedResourceId={resourceType === 'groups' ? selectedGroup : selectedUser}
					resourceType={resourceType}
					apps={apps}
				/>
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
