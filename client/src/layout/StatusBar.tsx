import { Circle, Link, Stack, Text, Divider } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { websocketStatusAtom } from '@/features/app/atoms';
import { useStatus } from '@/features/settings/hooks/workspace';
import { lspStatusAtom } from '@/components/Editor';

export const StatusBar = () => {
	const { status } = useStatus();
	const websocketIsConnected = useAtomValue(websocketStatusAtom);
	const lspIsConnected = useAtomValue(lspStatusAtom);
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
		</Stack>
	);
};
