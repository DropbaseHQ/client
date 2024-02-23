import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { POSTGRES_MONARCH_TOKENIZER } from '../utils/constants';
import { useMonacoTheme } from './useMonacoTheme';

import { provideTemplateItems } from '@/components/Editor/utils/template-string-suggestions';

export const useTemplateCompletion = (pageState: any) => {
	const monaco = useMonaco();

	useMonacoTheme(monaco);

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}

		monaco.languages.register({ id: 'plaintext' });
		monaco.languages.setMonarchTokensProvider('plaintext', POSTGRES_MONARCH_TOKENIZER as any);

		const { dispose } = monaco.languages.registerCompletionItemProvider('plaintext', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideTemplateItems(model, position, pageState),
		});

		return dispose;
	}, [monaco, pageState]);
};
