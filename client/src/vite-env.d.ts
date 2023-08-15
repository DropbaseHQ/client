/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_ENDPOINT: string;
	readonly VITE_PYTHON_LSP_SERVER: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
