import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { useAtomValue } from 'jotai';
import { MONARCH_TOKENIZER } from '../utils/constants';
import { useMonacoTheme } from './useMonacoTheme';

import { CompletionData, provideCompletionItems } from '../utils/sql-completion';
import { sourceAtom } from '@/features/app-builder/atoms';

export const useSQLCompletion = (databaseSchema: CompletionData, directoryStructure: any) => {
	const monaco = useMonaco();

	useMonacoTheme(monaco);

	const { dbType } = useAtomValue(sourceAtom);

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}

		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);

		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideCompletionItems(model, position, databaseSchema, directoryStructure, dbType),
		});

		return dispose;
	}, [monaco, databaseSchema, directoryStructure, dbType]);
};
