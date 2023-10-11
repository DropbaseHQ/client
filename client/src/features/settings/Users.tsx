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
	useDisclosure,
} from '@chakra-ui/react';
import { useGetWorkspaceUsers } from './hooks/useGetUsers';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';

export const Users = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { users } = useGetWorkspaceUsers({ workspaceId: workspaceId || '' });
	const {
		isOpen: inviteMemberIsOpen,
		onOpen: inviteMemberOnOpen,
		onClose: inviteMemberOnClose,
	} = useDisclosure();
	return (
		<PageLayout
			title="Workspace Members"
			action={
				<Button colorScheme="blue" size="sm" ml="auto">
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
					{users.map((item: any, index: number) => (
						<Tr key={index}>
							<Td>{item.email}</Td>
							<Td>{item.role_name}</Td>
							<Td>{item.group_names}</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
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
