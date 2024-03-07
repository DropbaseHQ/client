import { useState, useEffect } from 'react';
import { Button, Stack, Skeleton, Text, Flex, Table, Thead, Tr, Th, Tbody } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { PageLayout } from '@/layout';
import { useWorkspaces, workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useCreateProxyToken, useProxyTokens, ProxyToken } from '@/features/settings/hooks/token';

import { TokenModal } from './components/TokenModal/TokenModal';
import { WorkerTokenRow } from '@/features/settings/components/WorkerTokenRow';
import { URLMappingRow } from './components/URLMappingRow';
import { useCreateURLMapping, useURLMappings } from './hooks/urlMappings';

export const DeveloperSettings = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const [, setWorkerUrl] = useState('');
	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const { urlMappings } = useURLMappings();
	const { workspaces } = useWorkspaces();
	const createMutation = useCreateProxyToken();
	const createMappingMutation = useCreateURLMapping();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
	const handleGenerateToken = async () => {
		createMutation.mutate({
			workspaceId: workspaceId || '',
		});
	};

	const handleGenerateMapping = async () => {
		createMappingMutation.mutate({
			workspaceId: workspaceId || '',
			client_url: '',
			worker_url: '',
			worker_ws_url: '',
		});
	};

	useEffect(() => {
		if (currentWorkspace) {
			setWorkerUrl(currentWorkspace?.worker_url);
		}
	}, [currentWorkspace]);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<PageLayout title="Developer Settings">
			<TokenModal />
			<Stack>
				<Flex direction="row" justifyContent="space-between" alignItems="center">
					<Stack spacing="0.5">
						<Text fontSize="lg" fontWeight="bold">
							Worker Tokens
						</Text>

						<Text fontSize="md" fontWeight="medium">
							Generate workspace token for your worker
						</Text>
					</Stack>
					<Button
						w="fit-content"
						variant="outline"
						isLoading={createMutation.isLoading}
						onClick={handleGenerateToken}
					>
						Generate Token
					</Button>
				</Flex>

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

				<Flex mt="2" direction="row" justifyContent="space-between" alignItems="center">
					<Stack spacing="0.5">
						<Text fontSize="lg" fontWeight="bold">
							URL Mappings
						</Text>

						<Text fontSize="md" fontWeight="medium">
							Map worker URLs depending on your client URL
						</Text>
					</Stack>
					<Button
						w="fit-content"
						variant="outline"
						isLoading={createMutation.isLoading}
						onClick={handleGenerateMapping}
					>
						Generate Mapping
					</Button>
				</Flex>
				<Table
					w="container.lg"
					borderLeftWidth="1px"
					borderRightWidth="1px"
					variant="simple"
				>
					<Thead>
						<Tr>
							<Th>Client URL</Th>
							<Th>Worker URL</Th>
							<Th>Worker WS URL</Th>
							<Th>Active</Th>
							<Th>Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{urlMappings.map((token: any) => {
							return <URLMappingRow urlMapping={token} />;
						})}
					</Tbody>
				</Table>
			</Stack>
		</PageLayout>
	);
};
