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
	Flex,
	Badge,
	IconButton,
	ButtonGroup,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	useDisclosure,
	useClipboard,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { CheckCircle, Circle, Copy, X } from 'react-feather';
import copy from 'copy-to-clipboard';
import { PageLayout } from '@/layout';
import { workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import {
	useCreateProxyToken,
	useProxyTokens,
	ProxyToken,
	useUpdateWorkspaceProxyToken,
	useDeleteProxyToken,
} from '@/features/settings/hooks/token';
import { proxyTokenAtom } from '@/features/settings/atoms';
import { useToast } from '@/lib/chakra-ui';

const ProxyTokenCard = ({ token }: { token: ProxyToken }) => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedToken, setToken] = useAtom(proxyTokenAtom);
	const { hasCopied, onCopy } = useClipboard('test');
	const toast = useToast();

	const isSelected = selectedToken === token.token;

	const updateTokenMutation = useUpdateWorkspaceProxyToken({
		onSuccess: () => {
			toast({
				title: 'Token updated',
				status: 'info',
			});
		},
	});
	const deleteTokenMutation = useDeleteProxyToken({
		onSuccess: () => {
			toast({
				title: 'Token deleted',
				status: 'info',
			});
		},
	});
	const handleChooseToken = () => {
		updateTokenMutation.mutate({
			workspaceId,
			tokenId: token.token_id,
		});
		setToken(token.token);
	};
	const handleDeleteToken = () => {
		deleteTokenMutation.mutate({
			workspaceId,
			tokenId: token.token_id,
		});
	};

	const maskedString = (token_str: string) => {
		if (token_str.length < 8) {
			return token_str;
		}
		return '*'.repeat(token_str.length - 4) + token_str.slice(-4);
	};

	return (
		<Flex
			direction="column"
			key={token.token_id}
			cursor="pointer"
			overflow="hidden"
			borderWidth="1px"
			borderColor={isSelected ? 'blue.500' : 'gray.200'}
			borderRadius="md"
			justifyContent="center"
			bg="white"
			p="2"
			width="full"
			as="button"
			onClick={handleChooseToken}
			_hover={{
				shadow: 'sm',
			}}
		>
			<Flex w="full" justifyContent="space-between">
				{token.owner_selected && (
					<Badge h="min" size="xs">
						Owner Selected
					</Badge>
				)}
				<Popover
					returnFocusOnClose={false}
					isOpen={isOpen}
					onOpen={onOpen}
					onClose={onClose}
					placement="right"
				>
					<PopoverTrigger>
						<IconButton
							aria-label="Delete token"
							size="xs"
							minW="4"
							minH="4"
							h="min"
							ml="auto"
							borderRadius="md"
							bgColor="red.500"
							icon={<X size="12" />}
							onClick={(e) => {
								e.stopPropagation();
								onOpen();
							}}
						/>
					</PopoverTrigger>
					<PopoverContent
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<PopoverArrow />
						<PopoverCloseButton />
						<PopoverHeader textAlign="left">Confirm delete token!</PopoverHeader>
						<PopoverBody textAlign="left">
							Are you sure you want to delete this token?
						</PopoverBody>
						<PopoverFooter display="flex" justifyContent="flex-end">
							<ButtonGroup size="sm">
								<Button onClick={onClose} variant="outline">
									Cancel
								</Button>
								<Button
									isLoading={deleteTokenMutation.isLoading}
									onClick={handleDeleteToken}
									colorScheme="red"
								>
									Delete
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</PopoverContent>
				</Popover>
			</Flex>
			<Stack direction="column" width="full" spacing="0">
				<Flex>
					<Text as="b">Name:</Text>
					<Text ml="1">{token.name}</Text>
				</Flex>
				<Flex>
					<Text as="b">Region:</Text>
					<Text ml="1">{token.region}</Text>
				</Flex>
				<Flex alignItems="center">
					<Text as="b">Token:</Text>
					<Text ml="1">{maskedString(token.token)}</Text>
					<IconButton
						flexShrink="0"
						variant="ghost"
						icon={hasCopied ? <CheckCircle size="14" /> : <Copy size="14" />}
						size="xs"
						height="24px"
						onClick={() => {
							onCopy();
							copy(token.token);
							toast({
								title: 'Token copied',
								status: 'success',
							});
						}}
						aria-label="Copy token"
					/>
				</Flex>
			</Stack>
		</Flex>
	);
};

export const DeveloperSettings = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const [selectedToken] = useAtom(proxyTokenAtom);

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
					{tokens.map((token: ProxyToken) => {
						return <ProxyTokenCard token={token} />;
					})}
				</SimpleGrid>
			</Stack>
		</PageLayout>
	);
};
