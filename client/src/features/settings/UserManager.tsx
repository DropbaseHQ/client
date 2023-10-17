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
	Tag,
	IconButton,
	HStack,
} from '@chakra-ui/react';
import { UserMinus, Edit } from 'react-feather';
import { useGetWorkspaceUsers, GET_WORKSPACE_USERS_QUERY_KEY } from './hooks/useGetUsers';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';
import { useInviteMember } from './hooks/useInviteMember';
import { useQueryClient } from 'react-query';
import { useRemoveMember } from './hooks/useRemoveUserFromWorkspace';
import { useUpdateUserRole } from './hooks/useUpdateUserRole';

// Will get this from the server later
const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
const DEV_UUID = '00000000-0000-0000-0000-000000000002';
const USER_UUID = '00000000-0000-0000-0000-000000000003';
const MEMBER_UUID = '00000000-0000-0000-0000-000000000004';

const UserRow = (item: any) => {
	const workspaceId = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();

	const [newRole, setNewRole] = useState(item.user.role_id);

	const { isOpen: isOpenRemove, onOpen: onOpenRemove, onClose: onCloseRemove } = useDisclosure();
	const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
	const removeMemberMutation = useRemoveMember({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			onCloseRemove();
		},
	});
	const changeUserRoleMutation = useUpdateUserRole({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			onCloseEdit();
		},
	});

	const handleRemoveMember = () => {
		removeMemberMutation.mutate({
			userId: item.user.id,
			workspaceId,
		});
	};
	const handleChangeRole = () => {
		changeUserRoleMutation.mutate({
			userId: item.user.id,
			workspaceId,
			roleId: newRole,
		});
	};

	return (
		<Tr key={item.user.id}>
			<Td>{item.user.email}</Td>
			<Td>
				<HStack spacing="6">
					<Text>{item.user.role_name}</Text>
					<Popover
						isOpen={isOpenEdit}
						onClose={onCloseEdit}
						onOpen={onOpenEdit}
						placement="right"
					>
						<PopoverTrigger>
							<IconButton
								aria-label="Edit Role"
								size="xs"
								p="0"
								variant="outline"
								icon={<Edit size="14" />}
							/>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader>Change member role</PopoverHeader>
							<PopoverBody>
								<Select
									size="sm"
									value={newRole}
									onChange={(e) => setNewRole(e.target.value)}
								>
									<option value={ADMIN_UUID}>Admin</option>
									<option value={DEV_UUID}>Dev</option>
									<option value={USER_UUID}>User</option>
									<option value={MEMBER_UUID}>Member</option>
								</Select>
							</PopoverBody>
							<PopoverFooter display="flex" justifyContent="flex-end">
								<ButtonGroup size="sm">
									<Button
										colorScheme="blue"
										onClick={handleChangeRole}
										isLoading={changeUserRoleMutation.isLoading}
									>
										Change
									</Button>
									<Button variant="outline" onClick={onCloseEdit}>
										Cancel
									</Button>
								</ButtonGroup>
							</PopoverFooter>
						</PopoverContent>
					</Popover>
				</HStack>
			</Td>
			<Td>
				<Flex justifyContent="space-between">
					<Flex>
						{item.user?.groups?.map((obj: any) => <Tag size="sm">{obj.name}</Tag>)}
					</Flex>
					<Popover
						isOpen={isOpenRemove}
						onClose={onCloseRemove}
						onOpen={onOpenRemove}
						placement="left"
					>
						<PopoverTrigger>
							<IconButton
								aria-label="Remove Member"
								size="xs"
								colorScheme="red"
								icon={<UserMinus size="18" />}
							/>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader>Confirm member removal</PopoverHeader>
							<PopoverBody>
								<Text>{`Are you sure you want to\nremove ${item.user.email}?`}</Text>
							</PopoverBody>
							<PopoverFooter display="flex" justifyContent="flex-end">
								<ButtonGroup size="sm">
									<Button
										colorScheme="blue"
										onClick={handleRemoveMember}
										isLoading={removeMemberMutation.isLoading}
									>
										Remove
									</Button>
									<Button variant="outline" onClick={onCloseRemove}>
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
	const { users } = useGetWorkspaceUsers();
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
