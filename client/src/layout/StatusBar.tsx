import { useQuery } from 'react-query';
import { Circle, Link, Stack, Text, Divider } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { workerAxios } from '../lib/axios';
import { useWorkerWorkspace, workspaceAtom } from '@/features/workspaces';
import { websocketStatusAtom } from '@/features/app/atoms';
import { useSetWorkerAxiosBaseURL } from '@/features/authorization/hooks/useLogin';
import { lspStatusAtom } from '@/components/Editor';
import { RestrictAppContainer } from '@/container/components/RestrictAppContainer';
import { isFreeApp } from '@/utils';

export const STATUS_QUERY_KEY = 'allFiles';

const fetchStatus: any = async () => {
	const response = await workerAxios.get<any>(`/health/`);
	return response;
};

export const useStatus = () => {
	const queryKey = [STATUS_QUERY_KEY];
	const { isFetched } = useSetWorkerAxiosBaseURL();

	const { data: response, ...rest } = useQuery(queryKey, () => fetchStatus(), {
		refetchInterval: 10 * 1000,
		refetchIntervalInBackground: true,
		enabled: isFreeApp() ? true : isFetched,
	});

	return {
		...rest,
		isConnected: response?.status === 200,
		queryKey,
	};
};

export const StatusBar = () => {
	const { status } = useStatus();
	const websocketIsConnected = useAtomValue(websocketStatusAtom);
	const lspIsConnected = useAtomValue(lspStatusAtom);
	const currentWorkspace = useAtomValue(workspaceAtom);
	const { workspace: workerWorkspace, isLoading } = useWorkerWorkspace();

	const selectedWorkspaceMatchesWorker = currentWorkspace?.id === workerWorkspace?.id;
	return (
		<Stack
			direction="row"
			spacing="1.5"
			alignItems="center"
			fontWeight="medium"
			p="1"
			h="full"
			bg="white"
			borderTopWidth="1px"
		>
			<Circle size="2" bg={status === 'success' ? 'green' : 'red'} />
			<Text fontSize="xs" noOfLines={1}>
				{status === 'success' ? 'Worker connected' : 'Worker not connected.'}
			</Text>
			<Divider orientation="vertical" />

			<Circle size="2" bg={websocketIsConnected ? 'green' : 'red'} />
			<Text noOfLines={1} fontSize="xs">
				{websocketIsConnected ? 'WS connected' : 'WS not connected'}
			</Text>

			<Divider orientation="vertical" />

			{/* don't show status if null */}
			{typeof lspIsConnected === 'boolean' && (
				<>
					<Circle size="2" bg={lspIsConnected ? 'green' : 'red'} />
					<Text noOfLines={1} fontSize="xs">
						{lspIsConnected ? 'LSP connected' : 'LSP not connected'}
					</Text>
				</>
			)}

			{status === 'error' ? (
				<Link
					display="inline"
					fontSize="xs"
					href="https://docs.dropbase.io/how-to-guides/troubleshoot-worker"
					target="_blank"
					rel="noreferrer noopener"
					isExternal
					mx="1"
				>
					Troubleshoot Worker Connection
				</Link>
			) : null}

			<RestrictAppContainer>
				{!selectedWorkspaceMatchesWorker && !isLoading ? (
					<>
						<Divider orientation="vertical" />
						<Circle size="2" bg="red" />
						<Text noOfLines={1} fontSize="xs">
							The selected workspace does not match the worker workspace.
						</Text>
					</>
				) : null}
			</RestrictAppContainer>
		</Stack>
	);
};
