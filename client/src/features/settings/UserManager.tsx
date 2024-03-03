import { useState } from 'react';
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Tag,
	Button,
	Box,
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
	Stack,
} from '@chakra-ui/react';
import { UserMinus } from 'react-feather';
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
	const handleChangeRole = (newValue: string) => {
		setNewRole(newValue);
		changeUserRoleMutation.mutate({
			userId: user.id,
			workspaceId,
			roleId: newValue,
		});
	};

	return (
		<Tr
			key={user.id}
			_hover={{
				bg: 'gray.100',
			}}
		>
			<Td border="1px 0px" borderColor="gray.200" w="min-content">
				{user.email}
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<HStack spacing="6">
					<Select
						size="sm"
						value={newRole}
						onChange={(e) => handleChangeRole(e.target.value)}
					>
						<option value={ADMIN_UUID}>Admin</option>
						<option value={DEV_UUID}>Dev</option>
						<option value={USER_UUID}>User</option>
						<option value={MEMBER_UUID}>Member</option>
					</Select>
				</HStack>
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Flex>
					{user?.groups?.map((obj: any) => (
						<Tag m="1" size="sm" key={obj?.id}>
							{obj.name}
						</Tag>
					))}
				</Flex>
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Flex justifyContent="space-between">
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

export const MemberFilter = ({
	name,
	operator,
	value,
	onChange,
}: {
	name: string;
	operator: string;
	value: string;
	onChange: (e: any) => void;
}) => {
	return (
		<Flex fontSize="sm" borderWidth="1px" borderRadius="sm" justifyContent="center">
			<Box h="full" py="1" px="3" display="flex" alignItems="center" borderRightWidth="1px">
				{name}
			</Box>
			<Box h="full" py="1" px="3" display="flex" alignItems="center" borderRightWidth="1px">
				{operator}
			</Box>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search"
				size="sm"
				colorScheme="blue"
				borderWidth="0"
			/>
		</Flex>
	);
};

export const Users = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);

	const [newMemberEmail, setNewMemberEmail] = useState('');
	const [newMemberRole, setNewMemberRole] = useState(MEMBER_UUID);

	const [emailFilter, setEmailFilter] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [groupFilter, setGroupFilter] = useState('');

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

	const filteredUsers = users.filter((user: any) => {
		const emailMatch = emailFilter
			? user.email.toLowerCase().includes(emailFilter.toLowerCase())
			: true;

		const roleMatch = roleFilter
			? user.role_name.toLowerCase().includes(roleFilter.toLowerCase())
			: true;
		const groupMatch = groupFilter
			? user.groups?.some((group: any) =>
					group.name.toLowerCase().includes(groupFilter.toLowerCase()),
			  )
			: true;
		return emailMatch && roleMatch && groupMatch;
	});

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
			<Stack
				bg="white"
				borderWidth="1px"
				borderRadius="sm"
				direction="row"
				p="1.5"
				alignItems="center"
				w="full"
			>
				<Stack
					direction="row"
					borderRadius="sm"
					px="2"
					spacing="6"
					flex="1"
					overflow="auto"
					w="full"
				>
					<MemberFilter
						name="Email"
						operator="="
						value={emailFilter}
						onChange={setEmailFilter}
					/>
					<MemberFilter
						name="Role"
						operator="="
						value={roleFilter}
						onChange={setRoleFilter}
					/>
					<MemberFilter
						name="Group"
						operator="="
						value={groupFilter}
						onChange={setGroupFilter}
					/>
				</Stack>
			</Stack>

			<Table variant="unstyled" layout="fixed">
				<Thead border="1px" borderColor="gray.200">
					<Tr>
						<Th border="1px 0px" borderColor="gray.200" w="15rem">
							Email
						</Th>
						<Th border="1px 0px" borderColor="gray.200">
							Workspace Role
						</Th>
						<Th>Groups</Th>
						<Th border="1px 0px" borderColor="gray.200">
							Actions
						</Th>
					</Tr>
				</Thead>
				<Tbody border="1px" borderColor="gray.200">
					{filteredUsers.map((item: any) => (
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
