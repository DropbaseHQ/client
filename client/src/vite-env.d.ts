/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_ENDPOINT: string;
	readonly VITE_PYTHON_LSP_SERVER: string;
	readonly VITE_WORKER_API_ENDPOINT: string;
	readonly VITE_WORKER_WS_ENDPOINT: string;
	readonly VITE_APP_TYPE: string;
	readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
