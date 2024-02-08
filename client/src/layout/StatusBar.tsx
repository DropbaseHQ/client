import { useQuery } from 'react-query';
import { Circle, Link, Stack, Text, Divider } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { workerAxios } from '../lib/axios';
import { websocketStatusAtom } from '@/features/app/atoms';

export const STATUS_QUERY_KEY = 'allFiles';

const fetchStatus: any = async () => {
	const response = await workerAxios.get<any>(`/health/`);
	return response;
};

export const useStatus = () => {
	const queryKey = [STATUS_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchStatus(), {
		refetchInterval: 10 * 1000,
		refetchIntervalInBackground: true,
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

	return (
		<Stack
			direction="row"
			spacing="1"
			alignItems="center"
			fontWeight="medium"
			p="1"
			h="full"
			bg="white"
			borderTopWidth="1px"
		>
			<Circle size="2" bg={status === 'success' ? 'green' : 'red'} />
			<Text fontSize="xs">
				{status === 'success' ? 'Worker connected' : 'Worker not connected.'}
			</Text>
			<Divider orientation="vertical" />
			<Circle ml="1" size="2" bg={websocketIsConnected ? 'green' : 'red'} />
			<Text fontSize="xs">{websocketIsConnected ? 'WS connected' : 'WS not connected'}</Text>

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
		</Stack>
	);
};
