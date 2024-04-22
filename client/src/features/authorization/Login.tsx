import {
	Box,
	Flex,
	Button,
	Container,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
	Text,
	// Divider,
} from '@chakra-ui/react';
import { GitHub } from 'react-feather';
import { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { GoogleLogin } from '@react-oauth/google';
import { useResendConfirmEmail } from './hooks/useResendConfirmationEmail';
import { useLogin, useGoogleLogin } from './hooks/useLogin';

import { useToast } from '@/lib/chakra-ui';
import { workspaceAtom } from '@/features/workspaces';
import { onboardingAtom } from '@/features/authorization';
import { workerAxios, setWorkerAxiosWorkspaceIdHeader, setWorkerAxiosToken } from '@/lib/axios';
import { getErrorMessage } from '../../utils';
import { showConfirmationAtom } from './atoms';

type FormValues = {
	email: string;
	password: string;
};

export const Login = () => {
	const navigate = useNavigate();
	const toast = useToast();
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();

	const updateWorkspace = useSetAtom(workspaceAtom);
	const updateOnboardingStatus = useSetAtom(onboardingAtom);
	const showConfirmation = useAtomValue(showConfirmationAtom);

	const [displayEmailConfirmation, setDisplayEmailConfirmation] = useState(showConfirmation);
	const {
		register,
		formState: { errors },
		handleSubmit,
		watch,
		setValue,
	} = useForm<FormValues>();

	const email = watch('email');

	useEffect(() => {
		setValue('email', searchParams.get('email') || '');
	}, [searchParams, setValue]);

	const { mutate: googleMutate } = useGoogleLogin({
		onError: (error: any) => {
			toast({
				title: 'Login Failed',
				status: 'error',
				description: getErrorMessage(error),
			});
			if (error.response?.status === 403) {
				setDisplayEmailConfirmation(true);
			}
		},
		onSuccess: (data: any) => {
			queryClient.clear();
			document.cookie = 'worker_sl_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			setWorkerAxiosToken(data?.access_token);
			localStorage.setItem('access_token', data?.access_token);
			localStorage.setItem('refresh_token', data?.refresh_token);
			workerAxios.defaults.headers.common['access-token'] = data?.access_token;

			updateWorkspace((prev) => ({ ...prev, id: data?.workspace?.id }));
			setWorkerAxiosWorkspaceIdHeader(data?.workspace?.id);
			setDisplayEmailConfirmation(false);
			updateOnboardingStatus(data?.onboarding || false);
			navigate('/apps');
		},
	});

	const { mutate, isLoading } = useLogin({
		onError: (error: any) => {
			toast({
				title: 'Login Failed',
				status: 'error',
				description: getErrorMessage(error),
			});
			if (error.response?.status === 403) {
				setDisplayEmailConfirmation(true);
			}
		},
		onSuccess: (data: any) => {
			queryClient.clear();
			if (localStorage.getItem('access_token')) {
				localStorage.removeItem('access_token');
			}
			if (localStorage.getItem('refresh_token')) {
				localStorage.removeItem('refresh_token');
			}
			document.cookie = 'worker_sl_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			setWorkerAxiosToken(data?.access_token);
			localStorage.setItem('access_token', data?.access_token);
			localStorage.setItem('refresh_token', data?.refresh_token);
			workerAxios.defaults.headers.Authorization = `Bearer ${data?.access_token}`;

			updateWorkspace((prev) => ({ ...prev, id: data?.workspace?.id }));
			setWorkerAxiosWorkspaceIdHeader(data?.workspace?.id);
			setDisplayEmailConfirmation(false);
			updateOnboardingStatus(data?.onboarding || false);
			navigate('/apps');
		},
	});
	const {
		mutate: resendConfirmEmail,
		isLoading: resendIsLoading,
		isSuccess: resendIsSuccess,
	} = useResendConfirmEmail();

	const onSubmit = handleSubmit((data) => {
		mutate(data);
	});

	const onResendConfirmEmail = () => {
		resendConfirmEmail({ email });
	};

	const onGoogleSuccess = (response: any) => {
		googleMutate(response);
	};

	const onGoogleError = () => {
		toast({
			title: 'Login Failed',
			status: 'error',
			description: 'Unable to log in with google',
		});
	};

	return (
		<Container display="flex" alignItems="center" h="100vh" maxW="lg">
			<Stack spacing="8">
				<Stack spacing="6">
					<Stack spacing={{ base: '2', md: '3' }} textAlign="center">
						<Heading size="sm">Log in to your account</Heading>
						<Link to="/register" data-cy="link-to-register">
							<Text color="fg.muted" fontSize="sm" textDecoration="underline">
								Don&apos;t have an account?
							</Text>
						</Link>
					</Stack>
				</Stack>
				<Box
					width="md"
					p="12"
					boxShadow="sm"
					bg="white"
					borderRadius="md"
					borderWidth="1px"
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
										data-cy="email"
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
										data-cy="password"
										{...register('password', {
											required: 'Password is required',
										})}
									/>

									<FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
								</FormControl>
							</Stack>
							<Stack spacing="6">
								<Button
									isLoading={isLoading}
									type="submit"
									colorScheme="blue"
									data-cy="sign-in"
								>
									Sign in
								</Button>

								<Link to="/forgot">
									<Text color="fg.muted" fontSize="sm" textDecoration="underline">
										Forgot Password?
									</Text>
								</Link>
								{/* <Divider /> */}
								<Stack display="none">
									<GoogleLogin
										onSuccess={onGoogleSuccess}
										onError={onGoogleError}
										size="medium"
										width={300}
										logo_alignment="center"
									/>
									<Button
										as={Link}
										rounded="md"
										variant="outline"
										colorScheme="gray"
										to={`https://github.com/login/oauth/authorize?scope=user:email&client_id=${
											import.meta.env.VITE_GITHUB_CLIENT_ID
										}`}
										w={300}
									>
										<GitHub size="14" />
										<Text ml="2" fontSize="md" fontWeight="medium">
											Sign in with Github
										</Text>
									</Button>
								</Stack>
							</Stack>
						</Stack>
					</form>
					{displayEmailConfirmation && (
						<Flex mt="6" direction="column">
							<Text color="orange.500" fontSize="md" align="center">
								Please confirm your email before logging in.
							</Text>
							<Text color="gray.500" fontSize="md" align="center">
								Make sure to check your spam folder.
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
					)}
				</Box>
			</Stack>
		</Container>
	);
};
