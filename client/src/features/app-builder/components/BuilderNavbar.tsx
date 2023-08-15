import { Flex, IconButton, Stack, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';

export const AppBuilderNavbar = () => {
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
		</Stack>
	);
};
