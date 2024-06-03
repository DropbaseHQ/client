import { getWebSocketURL, getLSPURL } from '@/utils/url';

export const useGetWebSocketURL = () => {
	return getWebSocketURL();
};

export const useGetLSPURL = () => {
	return getLSPURL();
};
