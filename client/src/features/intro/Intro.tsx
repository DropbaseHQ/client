import { Flex, VStack, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useWorkspaces, useCreateWorkspace } from '../workspaces';

export const Intro = () => {
	const navigate = useNavigate();
	const { workspaces } = useWorkspaces();
	const createWorkspace = useCreateWorkspace();
	const handleCreateWorkspace = () => {
		createWorkspace.mutate({});
	};
	useEffect(() => {
		if (workspaces.length > 0) {
			navigate('/apps');
		}
	});
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
				<Button colorScheme="blue" size="lg" onClick={handleCreateWorkspace}>
					Create Workspace
				</Button>
			</VStack>
		</Flex>
	);
};
