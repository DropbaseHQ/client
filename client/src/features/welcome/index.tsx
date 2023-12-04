import { Book } from 'react-feather';
import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { VideoList } from './components/VideoList';
import { PageLayout } from '@/layout';
import { Setup } from './components/Setup';

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
				>
					Docs
				</Button>
			}
		>
			<Stack spacing="4">
				<VideoList />
				<Stack p="4" spacing="4" direction="row">
					<Stack>
						<Text fontWeight="semibold" fontSize="lg">
							Setup Instructions:
						</Text>
						<Box p="2">
							<Setup />
						</Box>
					</Stack>

					<Box>add other info</Box>
				</Stack>
			</Stack>
		</PageLayout>
	);
};
