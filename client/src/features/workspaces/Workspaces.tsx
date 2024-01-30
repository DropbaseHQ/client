import { PageLayout } from '@/layout';
import { useWorkspaces } from '.';
import { useAtomValue, useSetAtom } from 'jotai';
import { workspaceAtom } from '.';
import { SimpleGrid, Skeleton, Box, Text } from '@chakra-ui/react';

export const Workspaces = () => {
	const { workspaces, isLoading } = useWorkspaces();
	const workspaceId = useAtomValue(workspaceAtom);
	const updateWorkspace = useSetAtom(workspaceAtom);
	const handleSwitchWorkspace = (workspaceId: string) => {
		updateWorkspace(workspaceId);
	};
	return (
		<PageLayout title="Workspaces">
			<SimpleGrid columns={4} spacing={4}>
				{isLoading ? (
					<>
						<Skeleton minH="24" />
						<Skeleton minH="24" />
						<Skeleton minH="24" />
						<Skeleton minH="24" />
					</>
				) : (
					workspaces?.map((workspace: any) => (
						<Box
							maxW="sm"
							borderWidth="2px"
							borderRadius="lg"
							overflow="hidden"
							borderColor={workspaceId === workspace.id ? 'blue.500' : 'gray.200'}
							boxShadow="md"
							_hover={{ cursor: 'pointer' }}
							p={3}
							data-cy={`workspace-${workspace?.oldest_user?.email}`}
							onClick={() => handleSwitchWorkspace(workspace.id)}
						>
							<Text>Name: {workspace.name}</Text>
							<Text>Owner: {workspace?.oldest_user?.email}</Text>
							<Text>Workspace ID: {workspace.id}</Text>
						</Box>
					))
				)}
			</SimpleGrid>
		</PageLayout>
	);
};
