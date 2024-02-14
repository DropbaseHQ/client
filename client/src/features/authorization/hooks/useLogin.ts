import { useMutation } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { MutationConfig } from '@/lib/react-query';
import { useWorkspaces, workspaceAtom } from '@/features/workspaces';
import {
	axios,
	setWorkerAxiosWorkspaceIdHeader,
	setWorkerAxiosToken,
	setWorkerAxiosBaseURL,
	setAxiosToken,
} from '@/lib/axios';

export type LoginResponse = {
	user: any;
	workspace: any;
	access_token?: string;
	refresh_token?: string;
};
const loginUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await axios.post<LoginResponse>(`/user/login`, {
		email,
		password,
	});

	return response.data;
};

export const useLogin = (mutationConfig: MutationConfig<typeof loginUser>) => {
	return useMutation(loginUser, {
		...(mutationConfig || {}),
	});
};

export const useSetAxiosToken = () => {
	const navigate = useNavigate();
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { pathname } = useLocation();
	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot');

	useEffect(() => {
		const fetchData = async () => {
			if (loginRoutes) return;

			if (localStorage.getItem('access_token')) {
				const savedAccessToken = localStorage.getItem('access_token');
				setWorkerAxiosToken(savedAccessToken);
				setAxiosToken(savedAccessToken);
			} else {
				try {
					const response = await axios.post('/user/refresh');
					const accessToken = response.data.access_token;
					localStorage.setItem('access_token', accessToken);
					setWorkerAxiosToken(accessToken);
					setAxiosToken(accessToken);
				} catch (error) {
					navigate('/login');
				}
			}
		};

		fetchData();
		setWorkerAxiosWorkspaceIdHeader(workspaceId || '');
	}, [navigate, workspaceId, loginRoutes]);
};
export const useSetWorkerAxiosBaseURL = () => {
	const [workspace] = useAtom(workspaceAtom);
	const workspaceId = workspace?.id;
	const { workspaces } = useWorkspaces();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
	useEffect(() => {
		if (currentWorkspace?.worker_url) {
			setWorkerAxiosBaseURL(`http://${currentWorkspace.worker_url}`);
		} else {
			setWorkerAxiosBaseURL(import.meta.env.VITE_WORKER_API_ENDPOINT);
		}
	}, [workspaces, workspaceId, currentWorkspace]);
};
