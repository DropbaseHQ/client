import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { useAtomValue } from 'jotai';
import { POSTGRES_MONARCH_TOKENIZER, MYSQL_MONARCH_TOKENIZER } from '../utils/constants';
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

		switch (dbType) {
			case 'postgres':
				monaco.languages.setMonarchTokensProvider('sql', POSTGRES_MONARCH_TOKENIZER as any);
				break;

			case 'pg':
				monaco.languages.setMonarchTokensProvider('sql', POSTGRES_MONARCH_TOKENIZER as any);
				break;

			case 'mysql':
				monaco.languages.setMonarchTokensProvider('sql', MYSQL_MONARCH_TOKENIZER as any);
				break; // add snowflake, sqlite, etc

			default:
				monaco.languages.setMonarchTokensProvider('sql', POSTGRES_MONARCH_TOKENIZER as any);
				break;
		}

		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (model, position) =>
				provideCompletionItems(model, position, databaseSchema, directoryStructure),
		});

		return dispose;
	}, [monaco, databaseSchema, directoryStructure, dbType]);
};
