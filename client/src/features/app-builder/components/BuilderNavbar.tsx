import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useAtom } from 'jotai';
import { formatDistanceToNow } from 'date-fns';
import { useSaveStudio } from '../hooks/useSaveStudio';
import { fetchersLastSavedAtom, uiCodeLastSavedAtom } from '../atoms/tableContextAtoms';

export const AppBuilderNavbar = () => {
	const { saveStudio, isLoading: saveStudioIsLoading } = useSaveStudio();
	const [fetchersLastSaved] = useAtom(fetchersLastSavedAtom);
	const [uiCodeLastSaved] = useAtom(uiCodeLastSavedAtom);

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
