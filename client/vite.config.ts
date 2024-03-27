import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const VISUALIZER = false;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		splitVendorChunkPlugin(),

		VISUALIZER &&
			visualizer({
				open: true,
				gzipSize: true,
				filename: 'chunks-report.html',
			}),
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
