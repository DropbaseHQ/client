import Axios from 'axios';
import { getWorkerURL } from '@/utils/url';

export const workerAxios = Axios.create({
	baseURL: getWorkerURL(),
	withCredentials: true,
});
