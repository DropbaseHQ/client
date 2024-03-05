import {
	Button,
	ListItem,
	OrderedList,
	Stack,
	Text,
	Box,
	useClipboard,
	IconButton,
	Code,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { CheckCircle, Copy, Download, ExternalLink } from 'react-feather';
import { useToast } from '@/lib/chakra-ui';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { useProxyTokens } from '@/features/settings/hooks/token';
import { workspaceAtom } from '@/features/workspaces';

const CodeSnippet = ({ code, file }: any) => {
	const toast = useToast();
	const { hasCopied, onCopy } = useClipboard(code);

	return (
		<Stack spacing="0">
			{file ? (
				<Box
					w="fit-content"
					fontSize="xs"
					fontWeight="semibold"
					as="pre"
					p="1"
					borderWidth="1px"
					borderBottomWidth="0"
					bg="gray.50"
				>
					{file}
				</Box>
			) : null}
			<Box
				borderWidth="1px"
				position="relative"
				as="pre"
				p="2"
				fontSize="sm"
				bg="gray.50"
				borderRadius="sm"
			>
				{code}

				<IconButton
					position="absolute"
					right="2px"
					flexShrink="0"
					bottom="2px"
					variant="ghost"
					icon={hasCopied ? <CheckCircle size="14" /> : <Copy size="14" />}
					size="xs"
					height="24px"
					onClick={() => {
						onCopy();
						toast({
							title: 'Copied to clipboard',
							status: 'success',
						});
					}}
					aria-label="Copy token"
				/>
			</Box>
		</Stack>
	);
};

export const Setup = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();

	const { tokens } = useProxyTokens({ userId: user.id, workspaceId });
	const firstToken = tokens[0] || { token: '' };
	return (
		<OrderedList spacing={6}>
			<ListItem>
				<Stack>
					<Text>Download docker desktop.</Text>
					<Button
						size="xs"
						as="a"
						variant="outline"
						href="https://www.docker.com/products/docker-desktop/"
						target="_blank"
						w="fit-content"
						textTransform="none"
						leftIcon={<Download size="12" />}
					>
						Download
					</Button>
				</Stack>
			</ListItem>
			<ListItem>
				<Stack>
					<Text>Clone the repo</Text>
					<CodeSnippet code="git clone https://github.com/DropbaseHQ/dropbase.git" />
				</Stack>
			</ListItem>
			<ListItem>
				<Stack>
					<Text>
						Create a <Code>.env</Code> at the root directory ( dropbase ) and copy this
					</Text>
					<CodeSnippet
						file=".env"
						code={`DROPBASE_TOKEN='${firstToken?.token}'\nDROPBASE_API_URL='https://api.dropbase.io'`}
					/>
				</Stack>
			</ListItem>
			<ListItem>
				<Stack>
					<Text>In your terminal, run the docker compose command at the root</Text>
					<CodeSnippet
						code="chmod +x start.sh
./start.sh"
					/>
				</Stack>
			</ListItem>
			<ListItem>
				<Stack>
					<Text>
						In your browser go to <Code>http://localhost:3030</Code> and login
					</Text>
					<Button
						size="xs"
						as="a"
						variant="outline"
						href="http://localhost:3030"
						target="_blank"
						w="fit-content"
						textTransform="none"
						leftIcon={<ExternalLink size="12" />}
					>
						Go to localhost
					</Button>
				</Stack>
			</ListItem>
		</OrderedList>
	);
};
