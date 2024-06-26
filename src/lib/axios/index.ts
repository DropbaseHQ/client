import Axios from 'axios';
import { WORKER_URL } from '@/utils/url';

export const workerAxios = Axios.create({
	baseURL: WORKER_URL,
	withCredentials: true,
});
