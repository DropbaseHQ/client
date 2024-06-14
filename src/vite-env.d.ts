/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TYPE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
