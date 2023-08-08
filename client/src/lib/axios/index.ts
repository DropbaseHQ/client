import Axios from 'axios';

export const axios = Axios.create({
	baseURL: import.meta.env.API_ENDPOINT,
	withCredentials: true,
});
