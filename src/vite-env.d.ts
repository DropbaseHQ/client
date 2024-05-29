/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_ENDPOINT: string;
	readonly VITE_APP_TYPE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
