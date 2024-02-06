import { useState, useEffect } from 'react';
import {
	Button,
	Stack,
	Skeleton,
	Text,
	SimpleGrid,
	Input,
	Alert,
	AlertIcon,
	AlertTitle,
	Flex,
	FormControl,
	FormLabel,
	InputGroup,
	InputRightElement,
	InputLeftAddon,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { PageLayout } from '@/layout';
import { useUpdateWorkspaceWorkerURL, useWorkspaces, workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useCreateProxyToken, useProxyTokens, ProxyToken } from '@/features/settings/hooks/token';
import { proxyTokenAtom } from '@/features/settings/atoms';
import { WorkerTokenCard } from './components/ProxyTokenCard';
import { TokenModal } from './components/TokenModal/TokenModal';

export const DeveloperSettings = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const [workerUrl, setWorkerUrl] = useState('');
	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const [selectedToken] = useAtom(proxyTokenAtom);
	const { workspaces } = useWorkspaces();
	const createMutation = useCreateProxyToken();
	const updateWorkspaceMutation = useUpdateWorkspaceWorkerURL();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
	const handleButtonClick = async () => {
		createMutation.mutate({
			workspaceId: workspaceId || '',
		});
	};
	const workerURLHasChanged = currentWorkspace?.worker_url !== workerUrl;
	const handleSaveWorkerUrl = () => {
		updateWorkspaceMutation.mutate({
			workspaceId,
			workerURL: workerUrl,
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
				<Flex direction="row" justifyContent="space-between" alignItems="center" mb="4">
					<Text fontSize="lg" fontWeight="bold">
						Worker Tokens
					</Text>
					<Button
						size="sm"
						w="fit-content"
						isLoading={createMutation.isLoading}
						onClick={handleButtonClick}
					>
						Generate Token
					</Button>
				</Flex>

				{/* {selectedToken ? null : (
					<Alert status="error">
						<AlertIcon />
						<AlertTitle>Please select a token to continue!</AlertTitle>
					</Alert>
				)} */}
				<SimpleGrid columns={3} spacing={4}>
					{tokens.map((token: ProxyToken) => {
						return <WorkerTokenCard token={token} />;
					})}
				</SimpleGrid>
				<Text fontSize="lg" fontWeight="bold" mb="4">
					Worker Settings
				</Text>
				<Flex direction="column">
					<FormControl>
						<FormLabel>Workspace ID</FormLabel>
						<Input value={workspaceId ? String(workspaceId) : ''} isReadOnly />
					</FormControl>
					<FormControl mt="4">
						<FormLabel>Worker URL</FormLabel>
						<InputGroup size="md">
							<InputLeftAddon>https://</InputLeftAddon>
							<Input
								placeholder="localhost:9000"
								value={workerUrl}
								onChange={(e) => {
									setWorkerUrl(e.target.value);
								}}
							/>
							{workerURLHasChanged && (
								<InputRightElement>
									<Button
										size="xs"
										mr="4"
										onClick={handleSaveWorkerUrl}
										isLoading={updateWorkspaceMutation.isLoading}
									>
										Save
									</Button>
								</InputRightElement>
							)}
						</InputGroup>
					</FormControl>
				</Flex>
			</Stack>
		</PageLayout>
	);
};
