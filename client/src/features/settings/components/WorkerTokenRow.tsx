import { useState, useRef, useEffect } from 'react';
import {
	Button,
	Text,
	Input,
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
	Tr,
	InputGroup,
	InputRightElement,
	Td,
	Stack,
	Box,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { CheckCircle, Copy, Edit, Trash2 } from 'react-feather';
import copy from 'copy-to-clipboard';
import { workspaceAtom } from '@/features/workspaces';
import {
	ProxyToken,
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

export const WorkerTokenRow = ({ token }: { token: ProxyToken }) => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const [selectedToken] = useAtom(proxyTokenAtom);

	const [isHover, setHover] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const { hasCopied, onCopy } = useClipboard('test');
	const toast = useToast();

	const [nameIsEditing, setNameIsEditing] = useState(false);
	const [newName, setNewName] = useState(token.name);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const isSelected = selectedToken === token.token;

	const handleMouseOver = () => {
		setHover(true);
	};

	const handleMouseOut = () => {
		setHover(false);
	};

	const deleteTokenMutation = useDeleteProxyToken({
		onSuccess: () => {
			toast({
				title: 'Token deleted',
				status: 'info',
			});
			onClose();
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

	const handleDeleteToken = () => {
		deleteTokenMutation.mutate({
			workspaceId,
			tokenId: token.id,
		});
	};

	const handleUpdateTokenName = (event: any) => {
		if (event.key === 'Enter') {
			updateTokenInfoMutation.mutate({
				workspaceId,
				tokenId: token.id,
				name: event.currentTarget.value,
			});
			setNameIsEditing(false);
		}
	};

	useEffect(() => {
		// Use a setTimeout to ensure that the input element is rendered before focusing
		if (nameIsEditing) {
			setTimeout(() => {
				nameInputRef.current?.focus();
			}, 0);
		}
	}, [nameIsEditing]);

	return (
		<Tr bg={isHover ? 'gray.50' : ''} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
			<Td w="25%">
				<Stack direction="row" alignItems="center">
					{isSelected ? (
						<Box color="green.500">
							<CheckCircle />
						</Box>
					) : null}

					{nameIsEditing ? (
						<Input
							ref={nameInputRef}
							size="sm"
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
					{isHover && !nameIsEditing && (
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
				</Stack>
			</Td>
			<Td w="60%">
				<InputGroup maxW="container.sm">
					<Input value={maskedString(token.token)} />
					<InputRightElement>
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
					</InputRightElement>
				</InputGroup>
			</Td>
			<Td isNumeric>
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
							colorScheme="red"
							variant="outline"
							icon={<Trash2 size="14" />}
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
						<PopoverHeader textAlign="left" fontSize="md">
							Confirm delete token!
						</PopoverHeader>
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
			</Td>
		</Tr>
	);
};
