import {
	Button,
	Stack,
	Skeleton,
	Text,
	SimpleGrid,
	Icon,
	Alert,
	AlertIcon,
	AlertTitle,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { CheckCircle, Circle } from 'react-feather';
import { PageLayout } from '@/layout';
import { workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useCreateProxyToken, useProxyTokens } from '@/features/settings/hooks/token';
import { proxyTokenAtom } from '@/features/settings/atoms';
import { useToast } from '@/lib/chakra-ui';

export const DeveloperSettings = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const [selectedToken, setToken] = useAtom(proxyTokenAtom);

	const toast = useToast();

	const createMutation = useCreateProxyToken();

	const handleButtonClick = async () => {
		createMutation.mutate({
			workspaceId,
			userId: user.id,
		});
	};

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<PageLayout title="Developer Settings">
			<Stack>
				{selectedToken ? null : (
					<Alert status="error">
						<AlertIcon />
						<AlertTitle>Please select a token to continue!</AlertTitle>
					</Alert>
				)}
				<Button
					size="sm"
					alignSelf="end"
					w="fit-content"
					isLoading={createMutation.isLoading}
					onClick={handleButtonClick}
				>
					Generate Proxy Token
				</Button>
				<SimpleGrid columns={3} spacing={4}>
					{tokens.map((token: any) => {
						const isSelected = selectedToken === token;
						return (
							<Stack
								direction="row"
								key={token}
								cursor="pointer"
								textOverflow="ellipsis"
								overflow="hidden"
								borderWidth="1px"
								borderColor={isSelected ? 'blue.500' : 'gray.200'}
								borderRadius="sm"
								bg="white"
								alignItems="center"
								p="6"
								as="button"
								onClick={() => {
									setToken(token);
									toast({
										title: 'Token updated',
										status: 'info',
									});
								}}
								_hover={{
									shadow: 'sm',
								}}
							>
								<Icon
									color={isSelected ? 'blue.500' : 'gray.500'}
									as={isSelected ? CheckCircle : Circle}
									boxSize={5}
								/>
								<Text fontSize="lg">{token}</Text>
							</Stack>
						);
					})}
				</SimpleGrid>
			</Stack>
		</PageLayout>
	);
};
