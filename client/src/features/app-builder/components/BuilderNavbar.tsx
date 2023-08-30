import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useAtom } from 'jotai';
import { formatDistanceToNow } from 'date-fns';
import { useSaveStudio } from '../hooks/useSaveStudio';
import { useGetPage } from '@/features/app/hooks';
import { fetchersLastSavedAtom, uiCodeLastSavedAtom } from '../atoms/tableContextAtoms';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export const AppBuilderNavbar = () => {
	const { saveStudio, isLoading: saveStudioIsLoading } = useSaveStudio();
	const [fetchersLastSaved] = useAtom(fetchersLastSavedAtom);
	const [uiCodeLastSaved] = useAtom(uiCodeLastSavedAtom);
	const { pageId } = useParams();
	const { page } = useGetPage(pageId || '');
	const navigate = useNavigate();
	const humanizedLastSaved = (timestamp: Date) => {
		if (!timestamp) {
			return 'N/a';
		}
		return formatDistanceToNow(timestamp, {
			addSuffix: true,
		});
	};

	return (
		<Stack alignItems="center" h="12" borderBottomWidth="1px" direction="row" bg="white">
			<Flex h="full" alignItems="center">
				<Button
					leftIcon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					h="full"
					colorScheme="gray"
					onClick={() => {
						navigate(`/apps/${page?.app_id}/${pageId}`);
					}}
				>
					Back to App
				</Button>
			</Flex>
			<Text fontSize="xs" ml="auto" color="gray.500">
				{`Last saved: Fetchers: ${humanizedLastSaved(
					fetchersLastSaved,
				)} UI: ${humanizedLastSaved(uiCodeLastSaved)}`}
			</Text>
			<Button
				size="xs"
				// ml="auto"
				mr="1rem"
				onClick={saveStudio}
				isLoading={saveStudioIsLoading}
			>
				Save
			</Button>
		</Stack>
	);
};
