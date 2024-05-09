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
	FormControl,
	FormLabel,
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

	return (
		<PageLayout title="Workspace Groups" pageProps={{ px: '0', pb: 0 }} titleProps={{ px: 6 }}>
			<Stack spacing="0" px="6" direction="row" borderTopWidth="1px" h="full">
				<Box w="15vw" h="100%" pt="6" pr="2">
					<Flex alignItems="center">
						<Text fontWeight="bold">Groups</Text>
						<Button
							size="sm"
							ml="auto"
							variant="outline"
							onClick={() => createGroupOnOpen()}
						>
							Create
						</Button>
					</Flex>

					<Stack mt="4" spacing="0">
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
					</Stack>
				</Box>
				<Divider mx="4" orientation="vertical" h="100%" />

				<Flex pt="6" h="full" w="40vw" flexDir="column">
					{selectedGroup ? (
						<>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
							>
								<Text fontWeight="bold">{selectedGroupDetails?.name}</Text>
								<Popover
									onOpen={addMemberOnOpen}
									isOpen={addMemberIsOpen}
									onClose={addMemberOnClose}
									placement="bottom-end"
								>
									<PopoverTrigger>
										<Button size="sm" variant="outline">
											Add Member
										</Button>
									</PopoverTrigger>
									<PopoverContent>
										<PopoverArrow />
										<PopoverCloseButton />
										<PopoverHeader fontSize="md">
											Add a member to this group!
										</PopoverHeader>
										<PopoverBody p="4" fontSize="md">
											<FormControl>
												<FormLabel>Select member</FormLabel>
												<Select
													placeholder="Select a member to invite"
													value={invitedMember}
													size="sm"
													onChange={(e) =>
														setInviteMember(e.target.value)
													}
												>
													{users
														?.filter(
															(user: any) =>
																!groupUsers.some(
																	(groupUser) =>
																		groupUser.id === user.id,
																),
														)
														.map((user: any) => (
															<option value={user.id}>
																{user.email}
															</option>
														))}
												</Select>
											</FormControl>
										</PopoverBody>
										<PopoverFooter display="flex" justifyContent="flex-end">
											<ButtonGroup size="sm">
												<Button
													variant="secondary"
													onClick={addMemberOnClose}
												>
													Cancel
												</Button>

												<Button
													colorScheme="blue"
													onClick={handleAddUserToGroup}
													isLoading={addUserToGroupMutation.isLoading}
												>
													Add
												</Button>
											</ButtonGroup>
										</PopoverFooter>
									</PopoverContent>
								</Popover>
							</Stack>

							<Stack
								direction="row"
								borderRadius="sm"
								spacing="6"
								overflow="auto"
								bg="white"
								alignItems="center"
								w="40vw"
								mt="2"
							>
								<PermissionsFilter
									name="Email"
									operator="="
									value={emailFilter}
									onChange={setEmailFilter}
								/>
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
						</>
					) : (
						<Text>Select a group to view members</Text>
					)}
				</Flex>
			</Stack>
			<Modal isOpen={createGroupIsOpen} onClose={createGroupOnClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader borderBottomWidth="1px">Create a new group</ModalHeader>
					<ModalCloseButton />
					<ModalBody p="4">
						<FormControl>
							<FormLabel>Enter Group Name</FormLabel>
							<Input
								placeholder="Group name"
								value={newGroupName}
								size="sm"
								onChange={(e) => {
									setNewGroupName(e.target.value);
								}}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter borderTopWidth="1px">
						<ButtonGroup size="sm">
							<Button variant="secondary" onClick={createGroupOnClose}>
								Cancel
							</Button>
							<Button
								colorScheme="blue"
								onClick={handleCreateGroup}
								isLoading={createGroupMutation.isLoading}
							>
								Create
							</Button>
						</ButtonGroup>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</PageLayout>
	);
};
