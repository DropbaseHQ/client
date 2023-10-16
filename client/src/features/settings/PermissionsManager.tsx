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
	Select,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
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
import { UserPolicySelector, GroupPolicySelector } from './components/PolicySelector';
import { GroupCard } from './Group';
import { UserCard } from './Users';
import { useGetWorkspaceUsers } from './hooks/useGetUsers';

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

export const Permissions = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const queryClient = useQueryClient();
	const {
		isOpen: createGroupIsOpen,
		onOpen: createGroupOnOpen,
		onClose: createGroupOnClose,
	} = useDisclosure();

	const { groups } = useGetWorkspaceGroups({ workspaceId: workspaceId || '' });
	const { users } = useGetWorkspaceUsers();
	const { apps } = useGetWorkspaceApps();
	const createGroupMutation = useCreateGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
			createGroupOnClose();
		},
	});

	const [selectedGroup, setSelectedGroup] = useState('' as string);
	const [selectedUser, setSelectedUser] = useState('' as string);
	const [newGroupName, setNewGroupName] = useState('' as string);
	const [resourceType, setResourceType] = useState('groups' as string);

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
				<Flex direction="column" flex="1">
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
