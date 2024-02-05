import {
	Button,
	Text,
	Flex,
	Link as ChakraLink,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	IconButton,
	useDisclosure,
	useClipboard,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { CheckCircle, Copy } from 'react-feather';
import copy from 'copy-to-clipboard';
import { useAtomValue } from 'jotai';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useCreateProxyToken, useProxyTokens } from '@/features/settings/hooks/token';
import { workspaceAtom } from '@/features/workspaces';
import { useToast } from '@/lib/chakra-ui';

export const TokenModal = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();

	const toast = useToast();
	const { hasCopied, onCopy } = useClipboard('test');
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const createMutation = useCreateProxyToken();

	const workspaceHasTokens = tokens.length > 0;
	const firstToken = tokens[0];

	const handleCreateToken = async () => {
		createMutation.mutate({
			workspaceId,
			userId: user.id,
		});
	};

	useEffect(() => {
		if (!workspaceHasTokens) {
			onOpen();
		}
	}, [workspaceHasTokens]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					{workspaceHasTokens ? 'Token Generated' : 'Generate Dropbase Token'}
				</ModalHeader>
				{workspaceHasTokens && <ModalCloseButton />}
				<ModalBody>
					{!workspaceHasTokens ? (
						<Flex>
							{/* <Input placeholder="Token Nickname" /> */}
							<Button
								onClick={handleCreateToken}
								isLoading={createMutation.isLoading}
								w="full"
							>
								Generate
							</Button>
						</Flex>
					) : (
						<Flex justifyContent="center" direction="column">
							<Flex alignItems="center">
								<Text as="b" mr="1">
									Token:
								</Text>
								<Text>{firstToken.token}</Text>
								<IconButton
									flexShrink="0"
									variant="ghost"
									icon={
										hasCopied ? <CheckCircle size="14" /> : <Copy size="14" />
									}
									size="xs"
									height="24px"
									onClick={() => {
										onCopy();
										copy(firstToken.token);
										toast({
											title: 'Token copied',
											status: 'success',
										});
									}}
									aria-label="Copy token"
								/>
							</Flex>
							<Flex mt="4" alignItems="center">
								<Text>Continue setting up Dropbase by following steps in</Text>
								<ChakraLink
									ml="1"
									href="https://docs.dropbase.io/category/setup/"
									target="_blank"
								>
									our docs.
								</ChakraLink>
							</Flex>
						</Flex>
					)}
				</ModalBody>
				<ModalFooter></ModalFooter>
			</ModalContent>
		</Modal>
	);
};
