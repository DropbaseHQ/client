import { Button, Flex, Stack } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';

export const AppBuilderNavbar = () => {
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
		</Stack>
	);
};
