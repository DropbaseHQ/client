import { Book } from 'react-feather';
import { Button } from '@chakra-ui/react';
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
				>
					Docs
				</Button>
			}
		>
			<VideoList />
		</PageLayout>
	);
};
