import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import VitePluginHtmlEnv from 'vite-plugin-html-env';
import { visualizer } from 'rollup-plugin-visualizer';

const VISUALIZER = false;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		VitePluginHtmlEnv({
			compiler: true,
		}),
		react(),
		splitVendorChunkPlugin(),

		VISUALIZER &&
			visualizer({
				open: true,
				gzipSize: true,
				filename: 'chunks-report.html',
			}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					// creating a chunk to @open-ish deps. Reducing the vendor chunk size
					if (id.includes('monaco')) {
						return id;
					}

					if (id.includes('vscode')) {
						return id;
					}

					if (id.includes('chakra')) {
						return id;
					}

					if (id.includes('glideapps')) {
						return id;
					}

					// creating a chunk to react routes deps. Reducing the vendor chunk size
					if (
						id.includes('react-router-dom') ||
						id.includes('@remix-run') ||
						id.includes('react-router')
					) {
						return '@react-router';
					}
				},
			},
		},
	},
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
