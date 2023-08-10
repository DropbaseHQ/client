import { useColorMode } from '@chakra-ui/react';
import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import GhDark from 'monaco-themes/themes/GitHub Dark.json';
import GhLight from 'monaco-themes/themes/GitHub Light.json';

export const useMonacoTheme = () => {
	const monaco = useMonaco();
	const { colorMode } = useColorMode();

	useEffect(() => {
		if (monaco) {
			const isDark = colorMode === 'dark';

			if (isDark) {
				monaco.editor.defineTheme('gh-dark', GhDark as any);
				monaco.editor.setTheme('gh-dark');
			} else {
				monaco.editor.defineTheme('gh-light', GhLight as any);
				monaco.editor.setTheme('gh-light');
			}
		}
	}, [monaco, colorMode]);
};
