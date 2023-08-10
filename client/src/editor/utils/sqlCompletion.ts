import * as monacoLib from 'monaco-editor';
import { PROPERTIES } from './constants';

const { CompletionItemKind } = monacoLib.languages;
type CompletionSuggestion = Omit<monacoLib.languages.CompletionItem, 'range'>;
export type CompletionData = Record<string, Record<string, string[]>>;

const SQL_KEYWORDS = ['select', 'from', 'with', 'as'];

const countChars = (str: string, char: string) => {
	return str.split(char).length - 1;
};

const completePhrase = (
	lineUpToCursor: string,
	completionData: CompletionData,
): CompletionSuggestion[] => {
	const [currentWord, prevWord, prevPrevWord] = lineUpToCursor.split(' ').reverse(); // the last three words of the current line
	const cleanedCurrentWord = currentWord.replace(/^("|\.)+|("|\.)+$/g, ''); // remove leading/trailing punctuation
	const [curSchema, curTable] = cleanedCurrentWord.split('.'); // the current schema and table

	const suggestions: CompletionSuggestion[] = [];
	if (prevWord?.toLowerCase() === 'from') {
		// populate all possible tables
		Object.keys(completionData).forEach((schema) => {
			Object.keys(completionData[schema]).forEach((table) => {
				if (`${schema}.${table}`.includes(cleanedCurrentWord)) {
					suggestions.push({
						label: `${schema}.${table}`,
						kind: CompletionItemKind.Property,
						insertText: `${schema}.${table}`,
					});
				}
			});
		});
		return suggestions;
	}

	if (prevWord?.toLowerCase() !== 'as' || !prevPrevWord) {
		// if not an alias or a select table, only offer keyword completions
		return SQL_KEYWORDS.filter((word) => word.includes(cleanedCurrentWord.toLowerCase())).map(
			(keyword) => ({
				label: keyword,
				kind: CompletionItemKind.Keyword,
				insertText: keyword,
			}),
		);
	}

	// now we are guaranteed to have words of the form [string, "as", string]
	if (countChars(currentWord, '.') > 2) {
		// if we have already typed a schema.table.column, only suggest properties
		PROPERTIES.forEach((prop) => {
			if (!currentWord.includes(prop)) {
				suggestions.push({
					label: prop,
					kind: CompletionItemKind.Property,
					insertText: prop,
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
						insertText: `${schema}.${table}.${col}`,
					});
				}
			});
		});
	});

	// strip leading/trailing punctuation
	if (curTable) {
		completionData[curSchema][curTable].forEach((col) => {
			if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord.endsWith(` ${col}`)) {
				suggestions.push({
					label: col,
					kind: CompletionItemKind.Property,
					insertText: col,
				});
			}
		});
	} else if (curSchema) {
		Object.keys(completionData[curSchema]).forEach((table) => {
			Object.keys(completionData[curSchema][table]).forEach((col) => {
				if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord.endsWith(` ${col}`)) {
					suggestions.push({
						label: table,
						kind: CompletionItemKind.Property,
						insertText: table,
					});
				}
			});
		});
	}

	// if we couldn't find any suggestions, suggest all valid schemas, tables, or columns
	// that match the current alias
	if (suggestions.length === 0) {
		let suggestionSource;
		if (!curSchema) {
			suggestionSource = Object.keys(completionData);
		} else if (!curTable) {
			suggestionSource = Object.keys(completionData[curSchema]);
		} else {
			suggestionSource = completionData[curSchema][curTable];
		}
		suggestionSource.forEach((name) => {
			suggestions.push({
				label: name,
				kind: CompletionItemKind.Property,
				insertText: name,
			});
		});
	}

	suggestions.forEach((suggestion) => {
		const sug = suggestion; // we do this to get around linting
		const periods = countChars(suggestion.label as string, '.'); // we only supply strings as labels
		sug.sortText = `${periods}${suggestion.label}`;
	});

	return suggestions;
};

export const provideCompletionItems = (
	model: monacoLib.editor.ITextModel,
	position: monacoLib.Position,
	completionData: CompletionData,
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
