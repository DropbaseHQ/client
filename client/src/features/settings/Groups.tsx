import { useState } from 'react';
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Button,
	Flex,
	Box,
	Text,
	Divider,
	Stack,
	VStack,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	Input,
	Select,
	ButtonGroup,
	IconButton,
	useDisclosure,
} from '@chakra-ui/react';
import { UserMinus } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';
import { workspaceAtom } from '@/features/workspaces';
import { PageLayout } from '@/layout';
import { PermissionsFilter } from './components/Permissions/PermissionsComponents';
import { GroupCard } from './GroupCard';
import {
	useGetWorkspaceGroups,
	GET_WORKSPACE_GROUPS_QUERY_KEY,
	useGetWorkspaceUsers,
} from './hooks/workspace';
import { useAddUserToGroup, useCreateGroup, useGetGroupUsers } from './hooks/group';
import { canUseGranularPermissionsAtom } from './atoms';

const GroupMemberRow = (item: any) => {
	const { user } = item;
	return (
		<Tr
			_hover={{
				bg: 'gray.100',
			}}
		>
			<Td border="1px 0px" borderColor="gray.200">
				{user.email}
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<IconButton
					aria-label="Remove member"
					size="xs"
					colorScheme="red"
					icon={<UserMinus size="14" />}
				/>
			</Td>
		</Tr>
	);
};

export const Groups = () => {
	const { groups } = useGetWorkspaceGroups();
	const { users } = useGetWorkspaceUsers();
	const canUseGranularPermissions = useAtomValue(canUseGranularPermissionsAtom);
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const [selectedGroup, setSelectedGroup] = useState('');
	const [newGroupName, setNewGroupName] = useState('' as string);
	const [emailFilter, setEmailFilter] = useState('' as string);
	const [invitedMember, setInviteMember] = useState('' as string);

	const { users: groupUsers, refetch: refetchGroupUsers } = useGetGroupUsers({
		groupId: selectedGroup,
	});

	const addUserToGroupMutation = useAddUserToGroup({
		onSuccess: () => {
			refetchGroupUsers();
		},
	});

	const {
		isOpen: createGroupIsOpen,
		onOpen: createGroupOnOpen,
		onClose: createGroupOnClose,
	} = useDisclosure();

	const {
		isOpen: addMemberIsOpen,
		onOpen: addMemberOnOpen,
		onClose: addMemberOnClose,
	} = useDisclosure();

	const selectedGroupDetails = groups.find((group) => group.id === selectedGroup);

	const queryClient = useQueryClient();
	const createGroupMutation = useCreateGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
		},
	});

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
		addMemberOnClose();
	};

	const filteredUsers = groupUsers.filter((user) => {
		if (emailFilter && !user.email.includes(emailFilter)) {
			return false;
		}
		// if (appFilter && !user.app.includes(appFilter)) {
		//     return false;
		// }
		return true;
	});

	if (!canUseGranularPermissions) {
		return (
			<PageLayout title="Permissions Manager">
				<Text fontSize="lg" color="gray.500">
					Granular permissions are not available for your current plan.
				</Text>
			</PageLayout>
		);
	}

	return (
		<PageLayout title="Workspace Groups" pageProps={{ pb: '0' }}>
			<Flex w="full" h="full">
				<Box w="15vw" h="100%" pr="2">
					<Flex alignItems="center">
						<Text fontWeight="bold">Groups</Text>
						<Button size="sm" ml="auto" onClick={() => createGroupOnOpen()}>
							Create
						</Button>
					</Flex>

					<VStack mt="4" spacing="0">
						{groups.map((group) => {
							return (
								<GroupCard
									key={group.id}
									group={group}
									selectedGroup={selectedGroup}
									setSelectedGroup={setSelectedGroup}
								/>
							);
						})}
					</VStack>
				</Box>
				<Divider mx="4" orientation="vertical" h="100%" />
				{selectedGroup ? (
					<Flex h="100%" w="40vw" flexDir="column">
						<Flex alignItems="center" justifyContent="space-between">
							<Text fontWeight="bold">{selectedGroupDetails?.name}</Text>
							<Popover
								onOpen={addMemberOnOpen}
								isOpen={addMemberIsOpen}
								onClose={addMemberOnClose}
								placement="bottom-end"
							>
								<PopoverTrigger>
									<Button size="sm" variant="outline">
										{' '}
										Add Member
									</Button>
								</PopoverTrigger>
								<PopoverContent>
									<PopoverArrow />
									<PopoverCloseButton />
									<PopoverHeader fontSize="md">
										Add a member to this group!
									</PopoverHeader>
									<PopoverBody fontSize="md">
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
											<Button variant="outline" onClick={addMemberOnClose}>
												Cancel
											</Button>
										</ButtonGroup>
									</PopoverFooter>
								</PopoverContent>
							</Popover>
						</Flex>

						<Stack
							bg="white"
							borderWidth="1px"
							borderRadius="sm"
							direction="row"
							p="1.5"
							alignItems="center"
							w="40vw"
							mt="2"
						>
							<Stack
								direction="row"
								borderRadius="sm"
								px="2"
								spacing="6"
								flex="1"
								overflow="auto"
							>
								<PermissionsFilter
									name="Email"
									operator="="
									value={emailFilter}
									onChange={setEmailFilter}
								/>
							</Stack>
						</Stack>
						<Table variant="unstyled" mt="2" w="40vw">
							<Thead border="1px" borderColor="gray.200">
								<Tr>
									<Th border="1px 0px" borderColor="gray.200" w="15rem">
										Email
									</Th>

									<Th border="1px 0px" borderColor="gray.200">
										Actions
									</Th>
								</Tr>
							</Thead>
							<Tbody border="1px" borderColor="gray.200">
								{filteredUsers.map((item: any) => (
									<GroupMemberRow user={item} key={item.id} />
								))}
							</Tbody>
						</Table>
					</Flex>
				) : (
					<Flex> Select a group to view members</Flex>
				)}
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
