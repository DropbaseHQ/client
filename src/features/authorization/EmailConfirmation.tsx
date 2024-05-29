import { Box, Container, Spinner, Text, Button, Flex } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfirmEmail } from './hooks/useConfirmEmail';

export const EmailConfirmation = () => {
	const { token, userId } = useParams();
	const navigate = useNavigate();
	const { isLoading, isSuccess } = useConfirmEmail({ userId: userId || '', token: token || '' });
	return (
		<Container display="flex" alignItems="center" justifyContent="center" h="100vh" maxW="lg">
			<Box
				minW="md"
				p="12"
				bg="bg-surface"
				boxShadow="sm"
				borderRadius="md"
				border="1px solid"
				borderColor="bg-muted"
			>
				{isLoading && <Spinner />}

				{isSuccess ? (
					<Flex direction="column">
						<Text textAlign="center" fontSize="md">
							Email Confirmation Success!
						</Text>
						<Button
							marginTop="4"
							onClick={() => {
								navigate('/login');
							}}
						>
							Login
						</Button>
					</Flex>
				) : (
					<Text textAlign="center" fontSize="md">
						Unable to confirm email!
					</Text>
				)}
			</Box>
		</Container>
	);
};
