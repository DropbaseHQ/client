import { useAtomValue, useSetAtom } from 'jotai';
import { SimpleGrid, Skeleton, Box, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { PageLayout } from '@/layout';
import { useWorkerWorkspace, useWorkspaces, workspaceAtom } from '@/features/workspaces';

export const Workspaces = () => {
	const { workspaces, isLoading } = useWorkspaces();
	const { id: selectedWorkspaceId } = useAtomValue(workspaceAtom);
	const { workspace: workerWorkspace } = useWorkerWorkspace();
	const updateWorkspace = useSetAtom(workspaceAtom);

	const isWorkerWorkspace = (targetWorkspaceId: string) => {
		return workerWorkspace?.id === targetWorkspaceId;
	};
	const handleSwitchWorkspace = (targetWorkspaceId: string) => {
		const targetWorkspace = workspaces?.find(
			(workspace: any) => workspace.id === targetWorkspaceId,
		);
		updateWorkspace(targetWorkspace);
	};
	const usableWorkspace = workspaces?.find(
		(workspace: any) => workspace.id === workerWorkspace?.id,
	);

	useEffect(() => {
		if (workerWorkspace && usableWorkspace) {
			updateWorkspace(usableWorkspace);
		}
	}, [workerWorkspace, usableWorkspace, updateWorkspace]);
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
							borderColor={
								selectedWorkspaceId === workspace.id ? 'blue.500' : 'gray.200'
							}
							bgColor={isWorkerWorkspace(workspace?.id) ? 'white' : 'gray.100'}
							boxShadow="md"
							_hover={{ cursor: 'pointer' }}
							p={3}
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
