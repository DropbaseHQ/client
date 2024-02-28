export const getWorkerURL = () => {
	return `${window.location.protocol}//${window.location.hostname}:9090`;
};

export const getWebSocketURL = () => {
	return `ws://${window.location.hostname}:9090/ws`;
};

export const getLSPURL = () => {
	return `ws://${window.location.hostname}:9095/lsp`;
};
