import { axios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useWorkspaces } from '@/features/workspaces';
import { useAtom } from 'jotai';
import { workspaceAtom } from '@/features/workspaces';
import { setWorkerAxiosToken, setWorkerAxiosBaseURL } from '@/lib/axios';

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

export const useSetWorkerAxiosToken = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (localStorage.getItem('worker_access_token')) {
				setWorkerAxiosToken(localStorage.getItem('worker_access_token'));
			} else {
				try {
					const response = await axios.post('/user/refresh');
					const accessToken = response.data.access_token;
					localStorage.setItem('worker_access_token', accessToken);
					setWorkerAxiosToken(accessToken);
				} catch (error) {
					navigate('/login');
				}
			}
		};

		fetchData();
	}, []);
};
export const useSetWorkerAxiosBaseURL = () => {
	const [workspaceId] = useAtom(workspaceAtom);
	const { workspaces } = useWorkspaces();
	const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
	useEffect(() => {
		if (currentWorkspace?.worker_url) {
			setWorkerAxiosBaseURL(`http://${currentWorkspace.worker_url}`);
		} else {
			setWorkerAxiosBaseURL(import.meta.env.VITE_WORKER_API_ENDPOINT);
		}
	}, [workspaces, workspaceId]);
};
