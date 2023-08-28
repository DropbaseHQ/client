import { theme as proTheme } from '@chakra-ui/pro-theme';
import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

import '@fontsource-variable/inter';

export const theme = extendTheme({
	...proTheme,
	colors: { ...baseTheme.colors, brand: baseTheme.colors.blue },
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
		heading: `Inter, apple-system, sans-serif`,
		body: `Inter, apple-system, sans-serif`,
	},
});
