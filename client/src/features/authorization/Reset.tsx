import { useResetPassword } from './hooks/useResetPassword';
import { useToast } from '@/lib/chakra-ui';
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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

type FormValues = {
	email: string;
	password: string;
	confirm: string;
};

export const ResetPassword = () => {
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<FormValues>();
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	// const email = searchParams.get('email') || '';
	// const token = searchParams.get('token') || '';
	const toast = useToast();

	const { mutate, isLoading } = useResetPassword({
		onError: (error) => {
			toast({
				title: 'Cannot reset password',
				status: 'error',
				description: error.message,
			});
		},
		onSuccess: () => {
			toast({
				title: 'Password reset successful',
				status: 'success',
				description: 'Login again with the updated password',
			});
			navigate('/login');
		},
	});

	const onSubmit = handleSubmit((data) => {
		mutate({
			...data,
			// email,
			// resetToken: token
		});
	});

	return (
		<Container display="flex" alignItems="center" h="100vh" maxW="lg">
			<Stack spacing="8">
				<Stack spacing="6">
					<Stack spacing={{ base: '2', md: '3' }} textAlign="center">
						{/* <Logo height={65} /> */}
						<Heading size="sm">Reset password</Heading>
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
								<FormControl>
									<FormLabel htmlFor="email">Email</FormLabel>
									<Input
										placeholder="Please enter your email"
										id="email"
										type="email"
										{...register('email', {
											required: 'Email is required',
										})}
										// value={email}
										// disabled
									/>
								</FormControl>
								<FormControl isInvalid={!!errors?.password}>
									<FormLabel htmlFor="password">New Password</FormLabel>
									<Input
										placeholder="Please enter your password"
										id="password"
										type="password"
										{...register('password', {
											required: 'Password is required',
											validate: (value) => {
												if (value.length < 6) {
													return 'Your password needs a minimum of 6 characters';
												}
												if (value.search(/[a-z]/) < 0) {
													return 'Your password needs a lower case letter';
												}
												if (value.search(/[A-Z]/) < 0) {
													return 'Your password needs an uppser case letter';
												}
												if (value.search(/[0-9]/) < 0) {
													return 'Your password needs a number';
												}
												return true;
											},
										})}
									/>

									<FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
								</FormControl>
								<FormControl isInvalid={!!errors?.confirm}>
									<FormLabel htmlFor="confirm">Confirm New Password</FormLabel>
									<Input
										placeholder="Please confirm your password"
										id="confirm"
										type="password"
										{...register('confirm', {
											required: 'Password is required',
											validate: (value, formValues) => {
												if (value !== formValues.password) {
													return 'Password didnt match';
												}

												return true;
											},
										})}
									/>

									<FormErrorMessage>{errors?.confirm?.message}</FormErrorMessage>
								</FormControl>
							</Stack>
							<Stack spacing="6">
								<Button isLoading={isLoading} type="submit" variant="primary">
									Reset
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
