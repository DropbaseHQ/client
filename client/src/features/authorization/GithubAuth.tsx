import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, Flex, Progress, Box } from '@chakra-ui/react';
import { useAuthorizeGithub } from './hooks/useAuthGithub';

export const GithubAuth = () => {
	const { isLoading } = useAuthorizeGithub();
	const navigate = useNavigate();
	useEffect(() => {
		if (!isLoading) {
			navigate('/login');
		}
	}, [isLoading, navigate]);
	return (
		<Flex h="100%" w="100%" alignItems="center" justifyContent="center" direction="column">
			<Text>Authenticating with Github</Text>
			<Box mt="2" w="25%">
				<Progress size="xs" isIndeterminate />
			</Box>
		</Flex>
	);
};
