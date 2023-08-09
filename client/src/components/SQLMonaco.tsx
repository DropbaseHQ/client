import Editor, { useMonaco } from '@monaco-editor/react';
import * as monacoLib from 'monaco-editor';
import { useEffect } from 'react';
import { MONARCH_TOKENIZER, PROPERTIES, THEME } from './constants';

const { CompletionItemKind } = monacoLib.languages;
type CompletionSuggestion = Omit<monacoLib.languages.CompletionItem, 'insertText' | 'range'>;
type CompletionData = Record<string, Record<string, string[]>>;

const countChars = (str: string, char: string) => {
	return str.split(char).length - 1;
};

const completePhrase = (
	model: monacoLib.editor.ITextModel,
	position: monacoLib.Position,
	completionData: CompletionData,
): CompletionSuggestion[] => {
	const lineUpToPosition = model.getValueInRange({
		startLineNumber: position.lineNumber,
		startColumn: 1,
		endLineNumber: position.lineNumber,
		endColumn: position.column,
	});

	const [currentWord, prevWord, prevPrevWord] = lineUpToPosition.split(' ').reverse();

	const suggestions: CompletionSuggestion[] = [];
	if (prevWord?.toLowerCase() === 'from') {
		// populate all possible tables
		Object.keys(completionData).forEach((schema) => {
			Object.keys(completionData[schema]).forEach((table) => {
				suggestions.push({
					label: `${schema}.${table}`,
					kind: CompletionItemKind.Property,
				});
			});
		});
		return suggestions;
	}

	if (prevWord?.toLowerCase() !== 'as' || !prevPrevWord) {
		// if not an alias or a select table, do not offer completions
		return [];
	}

	// now we are guaranteed to have words of the form [string, "as", string]
	if (countChars(prevPrevWord, '.') > 2) {
		// if we have already typed a schema.table.column, only suggest properties
		PROPERTIES.forEach((prop) => {
			if (!currentWord.includes(prop)) {
				suggestions.push({
					label: prop,
					kind: CompletionItemKind.Property,
				});
			}
		});
		return suggestions;
	}

	// if we are typing an alias and have not finished typing it, offer full completions
	// based on the selected column in the form schema.table.column
	Object.keys(completionData).forEach((schema) => {
		Object.keys(completionData[schema]).forEach((table) => {
			completionData[schema][table].forEach((col) => {
				if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord.endsWith(` ${col}`)) {
					suggestions.push({
						label: `${schema}.${table}.${col}`,
						kind: CompletionItemKind.Property,
					});
				}
			});
		});
	});

	// strip leading/trailing punctuation
	const [curSchema, curTable] = currentWord.replace(/^("|\.)+|("|\.)+$/g, '').split('.');
	if (curTable) {
		completionData[curSchema][curTable].forEach((col) => {
			if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord.endsWith(` ${col}`)) {
				suggestions.push({
					label: `${col}`,
					kind: CompletionItemKind.Property,
				});
			}
		});
	} else if (curSchema) {
		Object.keys(completionData[curSchema]).forEach((table) => {
			Object.keys(completionData[curSchema][table]).forEach((col) => {
				if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord.endsWith(` ${col}`)) {
					suggestions.push({
						label: `${table}`,
						kind: CompletionItemKind.Property,
					});
				}
			});
		});
	}

	// if we couldn't find any suggestions, suggest all valid schemas, tables, or columns
	// that match the current alias
	if (suggestions.length === 0) {
		if (!curSchema) {
			Object.keys(completionData).forEach((schemaName) => {
				suggestions.push({
					label: `${schemaName}`,
					kind: CompletionItemKind.Property,
				});
			});
		} else if (!curTable) {
			Object.keys(completionData[curSchema]).forEach((tableName) => {
				suggestions.push({
					label: `${tableName}`,
					kind: CompletionItemKind.Property,
				});
			});
		} else {
			completionData[curSchema][curTable].forEach((col) => {
				suggestions.push({
					label: `${col}`,
					kind: CompletionItemKind.Property,
				});
			});
		}
	}

	suggestions.forEach((suggestion) => {
		const sug = suggestion; // we do this to get around linting
		const periods = countChars(suggestion.label as string, '.'); // we only supply strings as labels
		sug.sortText = `${periods}${suggestion.label}`;
	});

	return suggestions;
};

const completionProviderFunction = (
	model: monacoLib.editor.ITextModel,
	position: monacoLib.Position,
	completionData: CompletionData,
) => {
	// this wrapper function is required becauase the internal monaco type for
	// CompletionItem[] has two extra properties that are not actually mandatory
	// so we force a type cast so typescript is happy
	return {
		suggestions: completePhrase(
			model,
			position,
			completionData,
		) as unknown as monacoLib.languages.CompletionItem[],
	};
};

interface MonacoProps {
	editorProps: monacoLib.editor.IEditorConstructionOptions;
	completionData: CompletionData;
}

export function SQLMonaco({ editorProps, completionData }: MonacoProps) {
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			monaco.languages.register({ id: 'sql' });

			monaco.languages.setMonarchTokensProvider('sql', MONARCH_TOKENIZER as any);

			monaco.editor.defineTheme('sql', THEME);
			monaco.editor.setTheme('sql');

			monaco.languages.registerCompletionItemProvider('sql', {
				triggerCharacters: ['.', '"'],
				provideCompletionItems: (model, position) =>
					completionProviderFunction(model, position, completionData),
			});
		}
	}, [monaco, completionData]);

	return <Editor defaultLanguage="sql" defaultValue="SELECT * FROM ..." {...editorProps} />;
}
