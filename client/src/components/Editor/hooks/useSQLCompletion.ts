import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { MONARCH_TOKENIZER } from '../utils/constants';
import { useMonacoTheme } from './useMonacoTheme';

import { CompletionData, provideCompletionItems } from '../utils/sql-completion';

export const useSQLCompletion = (databaseSchema: CompletionData) => {
	const monaco = useMonaco();

	useMonacoTheme(monaco);

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}

		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);

		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideCompletionItems(model, position, databaseSchema),
		});

		return dispose;
	}, [monaco, databaseSchema]);
};
