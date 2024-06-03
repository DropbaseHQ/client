import { useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import GhDark from 'monaco-themes/themes/GitHub Dark.json';
import ChromeLight from 'monaco-themes/themes/GitHub Light.json';

export const useMonacoTheme = (monaco: any) => {
	const [themeLoaded, setThemeLoaded] = useState(false);
	const { colorMode } = useColorMode();

	useEffect(() => {
		if (!monaco) return;

		monaco.editor.defineTheme('gh-dark', GhDark);
		monaco.editor.defineTheme('chrome-devtools', ChromeLight);

		setThemeLoaded(true);
	}, [monaco]);

	useEffect(() => {
		if (monaco && themeLoaded) {
			const isDark = colorMode === 'dark';

			if (isDark) {
				monaco.editor.setTheme('gh-dark');
			} else {
				monaco.editor.setTheme('chrome-devtools');
			}
		}
	}, [monaco, themeLoaded, colorMode]);
};
