import { Book } from 'react-feather';
import {
	Box,
	Button,
	Divider,
	Stack,
	Text,
	UnorderedList,
	ListItem,
	Link,
	Flex,
} from '@chakra-ui/react';
import { VideoList } from './components/VideoList';
import { PageLayout } from '@/layout';

export const Welcome = () => {
	return (
		<PageLayout
			title="Welcome to Dropbase!"
			action={
				<Button
					leftIcon={<Book size="14" />}
					size="sm"
					ml="auto"
					variant="outline"
					colorScheme="blue"
					as={Link}
					href="https://docs.dropbase.io/"
					target="_blank"
				>
					Docs
				</Button>
			}
		>
			<Stack spacing="4">
				<VideoList />
				<Flex p="4" direction="row" justifyContent="space-between">
					<Divider orientation="vertical" mx="4" />
					<Box flex="3" p="2">
						<Text fontWeight="semibold" fontSize="lg">
							Helpful Links:
						</Text>
						<UnorderedList>
							<ListItem>
								<Link as="a" href="https://docs.dropbase.io/" target="_blank">
									Dropbase Documentation
								</Link>
							</ListItem>
							<ListItem>
								<Link
									as="a"
									href="https://docs.dropbase.io/how-to-guides/troubleshoot-worker"
									target="_blank"
								>
									Troubleshooting Worker Connections
								</Link>
							</ListItem>
							<ListItem>
								<Link
									as="a"
									href="https://docs.dropbase.io/concepts/apps"
									target="_blank"
								>
									Apps
								</Link>
							</ListItem>
							<ListItem>
								<Link
									as="a"
									href="https://docs.dropbase.io/concepts/state-and-context"
									target="_blank"
								>
									State and Context
								</Link>
							</ListItem>
						</UnorderedList>
						<Stack>
							<Text fontWeight="semibold" fontSize="lg" mt="4">
								Want to use Dropbase{`'`}s Hosted Client?
							</Text>
						</Stack>
					</Box>
				</Flex>
			</Stack>
		</PageLayout>
	);
};
