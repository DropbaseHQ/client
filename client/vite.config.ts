import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import VitePluginHtmlEnv from 'vite-plugin-html-env';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		VitePluginHtmlEnv({
			compiler: true,
		}),
		react(),
	],
	server: {
		port: 3030,
		open: '/',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
});
