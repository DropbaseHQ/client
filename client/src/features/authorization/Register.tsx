import { useRegister } from './hooks/useRegister';
// import { Logo } from '@/icons/logo';
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
import { Link, useNavigate } from 'react-router-dom';

type FormValues = {
	email: string;
	password: string;
	name: string;
	confirm: string;
};

export const Register = () => {
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<FormValues>();
	const navigate = useNavigate();

	const toast = useToast();

	const { mutate, isLoading } = useRegister({
		onError: (error) => {
			toast({
				title: 'Register Failed',
				status: 'error',
				description: error.message,
			});
		},
		onSuccess: () => {
			toast({
				title: 'Registered successfully',
				status: 'success',
				// description: 'Please check your mail for the confirmation link.',
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
						{/* <Logo height={65} /> */}
						<Heading size="sm">Sign up for dropbase</Heading>
						<Link to="/login">
							<Text color="fg.muted" fontSize="sm" textDecoration="underline">
								Already have an account?
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
								<FormControl isInvalid={!!errors?.name}>
									<FormLabel htmlFor="name">Name</FormLabel>
									<Input
										placeholder="Please enter your name"
										id="name"
										type="name"
										{...register('name', {
											required: 'name is required',
										})}
									/>

									<FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
								</FormControl>
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
											validate: (value) => {
												if (value.length < 6) {
													return 'Your password needs a minimum of 6 characters';
												}
												if (value.search(/[a-z]/) < 0) {
													return 'Your password needs a lower case letter';
												}
												if (value.search(/[A-Z]/) < 0) {
													return 'Your password needs an upper case letter';
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
									<FormLabel htmlFor="confirm">Confirm Password</FormLabel>
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
									Sign up
								</Button>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Container>
	);
};
