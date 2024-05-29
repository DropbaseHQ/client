import { useState, useEffect } from 'react';
import { Button, Stack, Skeleton, Text, Table, Thead, Tr, Th, Tbody } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { PageLayout } from '@/layout';
import { useWorkspaces, workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useCreateProxyToken, useProxyTokens, ProxyToken } from '@/features/settings/hooks/token';

import { TokenModal } from './components/TokenModal/TokenModal';
import { WorkerTokenRow } from '@/features/settings/components/WorkerTokenRow';
import { isFreeApp } from '@/utils';

export const DeveloperSettings = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const [, setWorkerUrl] = useState('');
	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const { workspaces } = useWorkspaces();
	const createMutation = useCreateProxyToken();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
	const handleGenerateToken = async () => {
		createMutation.mutate({
			workspaceId: workspaceId || '',
		});
	};

	useEffect(() => {
		if (!isFreeApp() && currentWorkspace) {
			setWorkerUrl(currentWorkspace?.worker_url);
		}
	}, [currentWorkspace]);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<PageLayout pageProps={{ overflow: 'auto' }} title="Developer Settings">
			<TokenModal />
			<Stack>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Stack spacing="0.5">
						<Text fontSize="lg" fontWeight="bold">
							Worker Tokens
						</Text>

						<Text fontSize="md" fontWeight="medium">
							Generate workspace token for your worker
						</Text>
					</Stack>
				</Stack>

				<Table
					w="container.lg"
					borderLeftWidth="1px"
					borderRightWidth="1px"
					variant="simple"
				>
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>Key</Th>
							<Th isNumeric>Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{tokens.map((token: ProxyToken) => {
							return <WorkerTokenRow token={token} />;
						})}
					</Tbody>
				</Table>

				<Button
					w="fit-content"
					variant="outline"
					isLoading={createMutation.isLoading}
					onClick={handleGenerateToken}
				>
					Generate Token
				</Button>
			</Stack>
		</PageLayout>
	);
};
