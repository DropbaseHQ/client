import { theme as proTheme } from '@chakra-ui/pro-theme';
import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

import '@fontsource-variable/inter';
import '@fontsource-variable/inter/wght.css';

export const theme = extendTheme({
	...proTheme,
	colors: {
		...baseTheme.colors,
		blue: {
			'50': '#dae9fb',
			'100': '#b5d4f7',
			'200': '#90bef3',
			'300': '#6ba9ef',
			'400': '#4693ec',
			'500': '#0066FF',
			'600': '#156acb',
			'700': '#1157a6',
			'800': '#0e4481',
			'900': '#0a305c',
		},
		gray: {
			'50': '#F8F9FA',
			'100': '#E9ECEF',
			'200': '#DEE2E6',
			'300': '#CED4DA',
			'400': '#ADB5BD',
			'500': '#6C757D',
			'600': '#495057',
			'700': '#343A40',
			'800': '#212529',
			'900': '#161616',
		},
		brand: {
			'50': '#dae9fb',
			'100': '#b5d4f7',
			'200': '#90bef3',
			'300': '#6ba9ef',
			'400': '#4693ec',
			'500': '#1775E1',
			'600': '#156acb',
			'700': '#1157a6',
			'800': '#0e4481',
			'900': '#0a305c',
		},
	},
	semanticTokens: {
		...((proTheme?.semanticTokens || {}) as any),
		colors: {
			...((proTheme?.semanticTokens as any)?.colors || {}),
			'bg-canvas': {
				default: 'gray.50',
				_dark: 'gray.300',
			},
		},
	},
	fonts: {
		heading: `'Inter Variable', apple-system, sans-serif`,
		body: `'Inter Variable', apple-system, sans-serif`,
		mono: `"Fira Code", SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
	},
});
