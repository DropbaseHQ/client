import { BG_UNFOCUSED } from '@/utils/constants';
import { Button, Flex, Stack } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useSaveStudio } from '../hooks/useSaveStudio';

export const AppBuilderNavbar = () => {
	const { saveStudio, isLoading: saveStudioIsLoading } = useSaveStudio();
	return (
		<Stack
			alignItems="center"
			h="12"
			borderBottomWidth="1px"
			direction="row"
			backgroundColor={BG_UNFOCUSED}
		>
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
			<Button
				size="sm"
				ml="auto"
				mr="1rem"
				onClick={saveStudio}
				isLoading={saveStudioIsLoading}
			>
				Save
			</Button>
		</Stack>
	);
};
