import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { useMonacoTheme } from './useMonacoTheme';
import { MONARCH_TOKENIZER } from '../utils/constants';

import { CompletionData, provideCompletionItems } from '../utils/sql-completion';

export const useSQLCompletion = (completionData: CompletionData) => {
	const monaco = useMonaco();

	useMonacoTheme();

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}

		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);

		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideCompletionItems(model, position, completionData),
		});
		return dispose;
	}, [monaco, completionData]);
};
