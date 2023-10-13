import { useState } from 'react';
import { PageLayout } from '@/layout';
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Input,
	useDisclosure,
	Select,
	VStack,
	Text,
	Flex,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	ButtonGroup,
} from '@chakra-ui/react';
import { useGetWorkspaceUsers, GET_WORKSPACE_USERS_QUERY_KEY } from './hooks/useGetUsers';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';
import { useInviteMember } from './hooks/useInviteMember';
import { useQueryClient } from 'react-query';
import { useGetWorkspaceGroups } from './hooks/useGetWorkspaceGroups';
import { useAddUserToGroup } from './hooks/useAddUserToGroup';
import { useRemoveUserFromGroup } from './hooks/useRemoveUserFromGroup';

// Will get this from the server later
const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
const DEV_UUID = '00000000-0000-0000-0000-000000000002';
const USER_UUID = '00000000-0000-0000-0000-000000000003';
const MEMBER_UUID = '00000000-0000-0000-0000-000000000004';

const UserRow = (item: any) => {
	const workspaceId = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [groupId, setGroupId] = useState('');
	const [action, setAction] = useState('');

	const { groups } = useGetWorkspaceGroups({ workspaceId });
	const addUserToGroupMutation = useAddUserToGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			onClose();
		},
	});
	const removeUserFromGroupMutation = useRemoveUserFromGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			onClose();
		},
	});

	const onOpenAddGroup = () => {
		setAction('add');
		onOpen();
	};
	const onOpenRemoveGroup = () => {
		setAction('remove');
		onOpen();
	};

	const handleAddUserToGroup = () => {
		addUserToGroupMutation.mutate({
			userId: item.user.user_id,
			groupId,
		});
	};
	const handleRemoveUserFromGroup = () => {
		removeUserFromGroupMutation.mutate({
			userId: item.user.user_id,
			groupId,
		});
	};
	const handleAction = () => {
		if (action === 'add') {
			handleAddUserToGroup();
		} else if (action === 'remove') {
			handleRemoveUserFromGroup();
		}
	};

	return (
		<Tr key={item.user.user_id}>
			<Td>{item.user.email}</Td>
			<Td>{item.user.role_name}</Td>
			<Td>
				<Flex justifyContent="space-between">
					<Text>{item.user?.group_names}</Text>
					<Popover
						returnFocusOnClose={false}
						isOpen={isOpen}
						onOpen={onOpen}
						onClose={onClose}
						placement="bottom"
						closeOnBlur={true}
					>
						<PopoverTrigger>
							<ButtonGroup>
								<Button size="xs" variant="outline" onClick={onOpenAddGroup}>
									Add Group
								</Button>
								<Button
									size="xs"
									variant="outline"
									color="red"
									onClick={onOpenRemoveGroup}
								>
									Remove Group
								</Button>
							</ButtonGroup>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader>
								{action === 'add' ? 'Add User to Group' : 'Remove User from Group'}
							</PopoverHeader>
							<PopoverBody>
								<Select
									value={groupId}
									onChange={(e) => {
										setGroupId(e.target.value);
									}}
								>
									{groups.map((group: any) => (
										<option value={group.id}>{group.name}</option>
									))}
								</Select>
							</PopoverBody>
							<PopoverFooter display="flex" justifyContent="flex-end">
								<ButtonGroup size="sm">
									<Button
										colorScheme="blue"
										onClick={handleAction}
										isLoading={addUserToGroupMutation.isLoading}
									>
										{action === 'add' ? 'Add' : 'Remove'}
									</Button>
									<Button variant="outline" onClick={onClose}>
										Cancel
									</Button>
								</ButtonGroup>
							</PopoverFooter>
						</PopoverContent>
					</Popover>
				</Flex>
			</Td>
		</Tr>
	);
};
export const Users = () => {
	const workspaceId = useAtomValue(workspaceAtom);

	const [newMemberEmail, setNewMemberEmail] = useState('');
	const [newMemberRole, setNewMemberRole] = useState(MEMBER_UUID);

	const queryClient = useQueryClient();
	const { users } = useGetWorkspaceUsers({ workspaceId: workspaceId || '' });
	const inviteMemberMutation = useInviteMember({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			inviteMemberOnClose();
		},
	});
	const {
		isOpen: inviteMemberIsOpen,
		onOpen: inviteMemberOnOpen,
		onClose: inviteMemberOnClose,
	} = useDisclosure();

	const handleInviteMember = () => {
		inviteMemberMutation.mutate({
			workspaceId: workspaceId || '',
			email: newMemberEmail,
			roleId: newMemberRole,
		});
	};
	return (
		<PageLayout
			title="Workspace Members"
			action={
				<Button colorScheme="blue" size="sm" ml="auto" onClick={inviteMemberOnOpen}>
					Add Member
				</Button>
			}
		>
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th>Email</Th>
						<Th>Role</Th>
						<Th>Groups</Th>
					</Tr>
				</Thead>
				<Tbody>
					{users.map((item: any) => (
						<UserRow user={item} key={item.id} />
					))}
				</Tbody>
			</Table>
			<Modal isOpen={inviteMemberIsOpen} onClose={inviteMemberOnClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Invite a member</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing="3">
							<Input
								placeholder="Member Email"
								value={newMemberEmail}
								onChange={(e) => {
									setNewMemberEmail(e.target.value);
								}}
							/>
							<Select
								placeholder="Select role"
								value={newMemberRole}
								onChange={(e) => {
									setNewMemberRole(e.target.value);
								}}
							>
								<option value={ADMIN_UUID}>Admin</option>
								<option value={DEV_UUID}>Dev</option>
								<option value={USER_UUID}>User</option>
								<option value={MEMBER_UUID}>Member</option>
							</Select>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							onClick={handleInviteMember}
							isLoading={inviteMemberMutation.isLoading}
						>
							Invite
						</Button>
						<Button variant="ghost" onClick={inviteMemberOnClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</PageLayout>
	);
};
