import { useState } from 'react';
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
	IconButton,
	HStack,
	Select,
} from '@chakra-ui/react';
import { UserMinus, Edit } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';
import {
	useGetWorkspaceUsers,
	GET_WORKSPACE_USERS_QUERY_KEY,
	useInviteMember,
	useRemoveMember,
	useUpdateUserRole,
} from './hooks/workspace';
import { workspaceAtom } from '@/features/workspaces';
import { PageLayout } from '@/layout';

// Will get this from the server later
const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
const DEV_UUID = '00000000-0000-0000-0000-000000000002';
const USER_UUID = '00000000-0000-0000-0000-000000000003';
const MEMBER_UUID = '00000000-0000-0000-0000-000000000004';

const UserRow = (item: any) => {
	const { user } = item;
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();

	const [newRole, setNewRole] = useState(user.role_id);

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
			userId: user.id,
			workspaceId,
		});
	};
	const handleChangeRole = () => {
		changeUserRoleMutation.mutate({
			userId: user.id,
			workspaceId,
			roleId: newRole,
		});
	};

	return (
		<Tr key={user.id}>
			<Td>{user.email}</Td>
			<Td>
				<HStack spacing="6">
					<Text>{user.role_name}</Text>
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
					{/* <Flex>
						{user?.groups?.map((obj: any) => (
							<Tag size="sm" key={obj?.id}>
								{obj.name}
							</Tag>
						))}
					</Flex> */}
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
								data-cy={`remove-member-${user.email}`}
								icon={<UserMinus size="18" />}
							/>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader fontSize="md">Confirm member removal</PopoverHeader>
							<PopoverBody>
								<Text fontSize="md">{`Are you sure you want to\nremove ${user.email}?`}</Text>
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
	const { id: workspaceId } = useAtomValue(workspaceAtom);

	const [newMemberEmail, setNewMemberEmail] = useState('');
	const [newMemberRole, setNewMemberRole] = useState(MEMBER_UUID);

	const queryClient = useQueryClient();
	const { users } = useGetWorkspaceUsers();

	const {
		isOpen: inviteMemberIsOpen,
		onOpen: inviteMemberOnOpen,
		onClose: inviteMemberOnClose,
	} = useDisclosure();

	const inviteMemberMutation = useInviteMember({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			inviteMemberOnClose();
		},
	});
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
				<Button
					colorScheme="blue"
					size="sm"
					ml="auto"
					data-cy="add-member"
					onClick={inviteMemberOnOpen}
				>
					Add Member
				</Button>
			}
		>
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th>Email</Th>
						<Th>Role</Th>
						{/* <Th>Groups</Th> */}
						<Th>Actions</Th>
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
								data-cy="new-member-email"
								onChange={(e) => {
									setNewMemberEmail(e.target.value);
								}}
							/>
							<Select
								placeholder="Select role"
								value={newMemberRole}
								data-cy="new-member-role"
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
							data-cy="invite-member"
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
