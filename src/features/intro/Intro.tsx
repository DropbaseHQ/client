import { Flex, VStack, Text } from '@chakra-ui/react';

export const Intro = () => {
	return (
		<Flex alignItems="center" justifyContent="center" h="full" w="full">
			<VStack spacing="8">
				<Text fontSize="4xl">Welcome to Dropbase!</Text>
				<VStack>
					<Text fontSize="xl" textAlign="center">
						To get started you can click the button below to create a workspace.
					</Text>
					<Text fontSize="xl" textAlign="center">
						If you created an account to join someone else&apos;s workspace, you can
						skip creating a workspace and wait for them to invite you.
					</Text>
				</VStack>
			</VStack>
		</Flex>
	);
};
