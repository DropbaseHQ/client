import { Flex, IconButton, Stack, Text, Button } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useSaveStudio } from '../hooks/useSaveStudio';
import { formatDistanceToNow } from 'date-fns';
import { fetchersLastSavedAtom, uiCodeLastSavedAtom } from '../atoms/tableContextAtoms';
import { useAtom } from 'jotai';

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
		<Stack alignItems="center" h="10" borderBottomWidth="1px" direction="row">
			<Flex h="full" alignItems="center">
				<IconButton
					aria-label="Go back to Apps"
					icon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					h="full"
					colorScheme="gray"
					borderRightWidth="1px"
				/>

				<Text fontSize="sm" fontWeight="medium" marginLeft="2">
					App Builder
				</Text>
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
