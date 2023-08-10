import { useMonaco } from '@monaco-editor/react';
import * as monacoLib from 'monaco-editor';
import SqlTheme from 'monaco-themes/themes/Cobalt2.json';
import { useEffect } from 'react';
import { CompletionData, completePhrase } from './completion';
import { MONARCH_TOKENIZER } from './constants';

export const useSqlMonaco = (completionData: CompletionData) => {
	const monaco = useMonaco();

	useEffect(() => {
		if (!monaco) {
			return () => {};
		}
		const provideCompletionItems = (
			model: monacoLib.editor.ITextModel,
			position: monacoLib.Position,
		) => {
			const lineUpToPosition = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column,
			});
			return {
				suggestions: completePhrase(
					lineUpToPosition,
					completionData,
				) as monacoLib.languages.CompletionItem[],
			};
		};

		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);
		monaco.editor.defineTheme('sql', SqlTheme as any);
		monaco.editor.setTheme('vs-dark');
		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems,
		});
		return dispose;
	}, [monaco, completionData]);
};
