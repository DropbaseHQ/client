import * as monacoLib from 'monaco-editor';
import SqlTheme from 'monaco-themes/themes/GitHub.json';
import { CompletionData, completePhrase } from './completion';
import { MONARCH_TOKENIZER } from './constants';

export const useSqlMonaco = (completionData: CompletionData) => {
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

	const setupMonaco = (monaco: typeof monacoLib) => {
		monaco.languages.register({ id: 'sql' });
		monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);
		monaco.editor.defineTheme('sql', SqlTheme as any);
		monaco.editor.setTheme('sql');
		const { dispose } = monaco.languages.registerCompletionItemProvider('sql', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems,
		});
		return dispose;
	};
	return { setupMonaco };
};
