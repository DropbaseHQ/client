import {
	Box,
	Button,
	Container,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
	Text,
} from '@chakra-ui/react';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { DropbaseLogo } from '@/components/Logo';
import { useRequestResetPasswordMail } from './hooks/useResetPassword';
import { useToast } from '@/lib/chakra-ui';

import { getErrorMessage } from '../../utils';

type FormValues = {
	email: string;
};

export const RequestResetLink = () => {
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<FormValues>();
	const navigate = useNavigate();

	const toast = useToast();

	const { mutate, isLoading } = useRequestResetPasswordMail({
		onError: (error) => {
			toast({
				title: 'Failed to send reset link',
				status: 'error',
				description: getErrorMessage(error),
			});
		},
		onSuccess: () => {
			toast({
				title: 'Reset link sent successfully',
				status: 'success',
				description: 'Please check your mail for the link.',
			});
			navigate('/login');
		},
	});

	const onSubmit = handleSubmit((data) => {
		mutate(data);
	});

	return (
		<Container display="flex" alignItems="center" h="100vh" maxW="lg">
			<Stack spacing="8">
				<Stack spacing="6">
					<Stack spacing={{ base: '2', md: '3' }} textAlign="center">
						<Box mx="auto" w="24">
							<DropbaseLogo />
						</Box>
						<Heading size="sm">Forgot Password?</Heading>
					</Stack>
				</Stack>
				<Box
					minW="md"
					p="12"
					bg="bg-surface"
					boxShadow="sm"
					borderRadius="md"
					border="1px solid"
					borderColor="bg-muted"
				>
					<form onSubmit={onSubmit}>
						<Stack spacing="6">
							<Stack spacing="5">
								<FormControl isInvalid={!!errors?.email}>
									<FormLabel htmlFor="email">Email</FormLabel>
									<Input
										placeholder="Please enter your email"
										id="email"
										type="email"
										{...register('email', {
											required: 'Email is required',
										})}
									/>

									<FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
								</FormControl>
							</Stack>
							<Stack spacing="6">
								<Button isLoading={isLoading} type="submit" variant="primary">
									Confirm
								</Button>
								<Link to="/login">
									<Text color="bg.muted" fontSize="sm" textDecoration="underline">
										Back to login
									</Text>
								</Link>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Container>
	);
};
