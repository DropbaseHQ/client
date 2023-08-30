import { useLogin } from './hooks/useLogin';
// import { Logo } from '@/icons/logo';
import { useToast } from '@/lib/chakra-ui';
import {
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

// import { useResendConfirmEmail } from './hooks/useResendConfirmEmail';

type FormValues = {
	email: string;
	password: string;
};

export const Login = () => {
	const navigate = useNavigate();
	const toast = useToast();

	const [displayEmailConfirmation, setDisplayEmailConfirmation] = useState(false);

	const {
		register,
		formState: { errors },
		watch,
		handleSubmit,
	} = useForm<FormValues>();

	const email = watch('email');

	const { mutate, isLoading } = useLogin({
		onError: (error) => {
			toast({
				title: 'Login Failed',
				status: 'error',
				description: error.response?.data?.detail || error.message,
			});
			if (error.response?.status === 403) {
				setDisplayEmailConfirmation(true);
			}
		},
		onSuccess: (data) => {
			setDisplayEmailConfirmation(false);
			navigate('/apps');
		},
	});

	// const {
	// 	mutate: resendConfirmEmail,
	// 	isLoading: resendIsLoading,
	// 	isSuccess: resendIsSuccess,
	// } = useResendConfirmEmail();

	const onSubmit = handleSubmit((data) => {
		mutate(data);
	});

	// const onResendConfirmEmail = () => {
	// 	resendConfirmEmail({ email });
	// };

	return (
		<Container display="flex" alignItems="center" h="100vh" maxW="lg">
			<Stack spacing="8">
				<Stack spacing="6">
					<Stack spacing={{ base: '2', md: '3' }} textAlign="center">
						{/* <Logo height={65} /> */}

						<Heading size="sm">Log in to your account</Heading>
						<Link to="/register">
							<Text color="fg.muted" fontSize="sm" textDecoration="underline">
								Don&apos;t have an account?
							</Text>
						</Link>
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
								<FormControl isInvalid={!!errors?.password}>
									<FormLabel htmlFor="password">Password</FormLabel>
									<Input
										placeholder="Please enter your password"
										id="password"
										type="password"
										{...register('password', {
											required: 'Password is required',
										})}
									/>

									<FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
								</FormControl>
							</Stack>
							<Stack spacing="6">
								<Button isLoading={isLoading} type="submit" variant="primary">
									Sign in
								</Button>
								<Link to="/forgot">
									<Text color="fg.muted" fontSize="sm" textDecoration="underline">
										Forgot Password?
									</Text>
								</Link>
							</Stack>
						</Stack>
					</form>
					{/* {displayEmailConfirmation && (
						<Flex mt="6" direction="column">
							<Text color="orange" fontSize="sm">
								You must first confirm your email before logging in.
							</Text>
							<Button
								marginTop="4"
								onClick={onResendConfirmEmail}
								isLoading={resendIsLoading}
								isDisabled={resendIsSuccess}
							>
								{resendIsSuccess ? 'Email sent' : 'Resend Confirmation Email'}
							</Button>
						</Flex>
					)} */}
				</Box>
			</Stack>
		</Container>
	);
};
