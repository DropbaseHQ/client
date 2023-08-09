import * as monacoLib from 'monaco-editor';
import SqlTheme from 'monaco-themes/themes/GitHub.json';
import { completePhrase, CompletionData } from './completion';
import { MONARCH_TOKENIZER } from './constants';

export const useSqlMonaco = (completionData: CompletionData) => {
	const provideCompletionItems = (
		model: monacoLib.editor.ITextModel,
		position: monacoLib.Position,
	) => {
		return {
			suggestions: completePhrase(
				model,
				position,
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
	};
	return { setupMonaco };
};
