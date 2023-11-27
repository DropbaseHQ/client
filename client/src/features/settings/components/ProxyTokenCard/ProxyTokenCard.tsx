import { useState, useRef, useEffect } from 'react';
import {
	Button,
	Stack,
	Text,
	Input,
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
import { CheckCircle, Copy, X, Edit } from 'react-feather';
import copy from 'copy-to-clipboard';
import { workspaceAtom } from '@/features/workspaces';
import {
	ProxyToken,
	useUpdateWorkspaceProxyToken,
	useDeleteProxyToken,
	useUpdateTokenInfo,
} from '@/features/settings/hooks/token';
import { proxyTokenAtom } from '@/features/settings/atoms';
import { useToast } from '@/lib/chakra-ui';

export const maskedString = (token_str: string) => {
	if (token_str.length < 8) {
		return token_str;
	}
	return '*'.repeat(token_str.length - 4) + token_str.slice(-4);
};

export const ProxyTokenCard = ({ token }: { token: ProxyToken }) => {
	const workspaceId = useAtomValue(workspaceAtom);
	const [selectedToken, setToken] = useAtom(proxyTokenAtom);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const { hasCopied, onCopy } = useClipboard('test');
	const toast = useToast();

	const [nameIsEditing, setNameIsEditing] = useState(false);
	const [newName, setNewName] = useState(token.name);
	const [regionIsEditing, setRegionIsEditing] = useState(false);
	const [newRegion, setNewRegion] = useState(token.region);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const regionInputRef = useRef<HTMLInputElement>(null);

	const isSelected = selectedToken === token.token;

	const updateWorkspaceTokenMutation = useUpdateWorkspaceProxyToken({
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
	const updateTokenInfoMutation = useUpdateTokenInfo({
		onSuccess: () => {
			toast({
				title: 'Token info updated',
				status: 'info',
			});
		},
	});

	const handleChooseToken = () => {
		updateWorkspaceTokenMutation.mutate({
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
	const handleUpdateTokenName = (event: any) => {
		if (event.key === 'Enter') {
			updateTokenInfoMutation.mutate({
				workspaceId,
				tokenId: token.token_id,
				name: event.currentTarget.value,
			});
			setNameIsEditing(false);
		}
	};
	const handleUpdateTokenRegion = (event: any) => {
		if (event.key === 'Enter') {
			updateTokenInfoMutation.mutate({
				workspaceId,
				tokenId: token.token_id,
				region: event.currentTarget.value,
			});
			setRegionIsEditing(false);
		}
	};

	useEffect(() => {
		// Use a setTimeout to ensure that the input element is rendered before focusing
		if (nameIsEditing) {
			setTimeout(() => {
				nameInputRef.current?.focus();
			}, 0);
		}
		if (regionIsEditing) {
			setTimeout(() => {
				regionInputRef.current?.focus();
			}, 0);
		}
	}, [nameIsEditing, regionIsEditing]);

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
				<Flex alignItems="center">
					<Text as="b" mr="1">
						Name:
					</Text>
					{nameIsEditing ? (
						<Input
							ref={nameInputRef}
							size="xs"
							value={newName}
							onChange={(e) => {
								setNewName(e.currentTarget.value);
							}}
							onKeyDown={handleUpdateTokenName}
							onBlur={() => setNameIsEditing(false)}
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					) : (
						<Text>{token.name}</Text>
					)}
					{!nameIsEditing && (
						<IconButton
							aria-label="Edit name"
							size="xs"
							height="24px"
							width="24px"
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								setNameIsEditing(true);
							}}
							icon={<Edit size="12" />}
						/>
					)}
				</Flex>
				<Flex>
					<Text as="b" mr="1">
						Region:
					</Text>
					{regionIsEditing ? (
						<Input
							ref={regionInputRef}
							size="xs"
							value={newRegion}
							onChange={(e) => {
								setNewRegion(e.currentTarget.value);
							}}
							onKeyDown={handleUpdateTokenRegion}
							onBlur={() => setRegionIsEditing(false)}
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					) : (
						<Text>{token.region}</Text>
					)}
					{!regionIsEditing && (
						<IconButton
							aria-label="Edit region"
							size="xs"
							height="24px"
							width="24px"
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								setRegionIsEditing(true);
							}}
							icon={<Edit size="12" />}
						/>
					)}
				</Flex>
				<Flex alignItems="center">
					<Text as="b" mr="1">
						Token:
					</Text>
					<Text>{maskedString(token.token)}</Text>
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