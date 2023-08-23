import { useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import GhDark from 'monaco-themes/themes/GitHub Dark.json';
import GhLight from 'monaco-themes/themes/GitHub Light.json';

export const useMonacoTheme = (monaco: any) => {
	const [themeLoaded, setThemeLoaded] = useState(false);
	const { colorMode } = useColorMode();

	useEffect(() => {
		if (!monaco) return;

		monaco.editor.defineTheme('gh-dark', GhDark);
		monaco.editor.defineTheme('gh-light', GhLight);

		setThemeLoaded(true);
	}, [monaco]);

	useEffect(() => {
		if (monaco && themeLoaded) {
			const isDark = colorMode === 'dark';

			if (isDark) {
				monaco.editor.setTheme('gh-dark');
			} else {
				monaco.editor.setTheme('gh-light');
			}
		}
	}, [monaco, themeLoaded, colorMode]);
};
