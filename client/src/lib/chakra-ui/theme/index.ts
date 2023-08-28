import { theme as proTheme } from '@chakra-ui/pro-theme';
import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

import '@fontsource-variable/inter';

export const theme = extendTheme({
	...proTheme,
	colors: { ...baseTheme.colors, brand: baseTheme.colors.blue },
	fonts: {
		heading: `Inter, apple-system, sans-serif`,
		body: `Inter, apple-system, sans-serif`,
	},
});
