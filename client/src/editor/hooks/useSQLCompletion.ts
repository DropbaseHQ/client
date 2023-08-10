import { useMonaco } from '@monaco-editor/react';
import SqlTheme from 'monaco-themes/themes/Cobalt2.json';
import { useEffect } from 'react';
import { MONARCH_TOKENIZER } from '../utils/constants';
import { CompletionData, provideCompletionItems } from '../utils/sqlCompletion';

export const useSqlMonaco = (completionData: CompletionData) => {
	const monaco = useMonaco();

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}

		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);
		monaco.editor.defineTheme('sql', SqlTheme as any);
		monaco.editor.setTheme('vs-dark');
		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideCompletionItems(model, position, completionData),
		});
		return dispose;
	}, [monaco, completionData]);
};
