import * as monacoLib from 'monaco-editor';
import { PROPERTIES } from './constants';

const { CompletionItemKind } = monacoLib.languages;
type CompletionSuggestion = Omit<monacoLib.languages.CompletionItem, 'range'>;
export interface CompletionData {
	schema: Record<string, Record<string, string[]>>;
	metadata: Record<string, string>;
}

const SQL_KEYWORDS = ['SELECT', 'FROM', 'AS', 'WHERE', 'ORDER BY', 'GROUP BY', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'AS', 'WITH'];

const countChars = (str: string, char: string) => {
	return str.split(char).length - 1;
};

const completePhrase = (
	lineUpToCursor: string,
	databaseSchema: CompletionData,
	directoryStructure: any,
): CompletionSuggestion[] => {
	const completionData = databaseSchema.schema;
	const [currentWord, prevWord, prevPrevWord] = lineUpToCursor.split(' ').reverse(); // the last three words of the current line
	const cleanedCurrentWord = currentWord.replace(/^("|\.)+|("|\.)+$/g, ''); // remove leading/trailing punctuation
	const [curSchema, curTable] = cleanedCurrentWord.split('.'); // the current schema and table

	const suggestions: CompletionSuggestion[] = [];

	const regex_state = /{{state(?:\.([^{}.]+))?(?:\.([^{}.]+))?/; // checks for strings that start with '{{state', and match up to two levels of dot-separated identifiers
    const match_state = lineUpToCursor.match(regex_state); // example match: "{{state.tables.table1"

	const regex_context = /{{context(?:\.([^{}.]+))?(?:\.([^{}.]+))?(?:\.([^{}.]+))?(?:\.([^{}.]+))?/; // checks for strings that start with '{{context', and match up to four levels of dot-separated identifiers
    const match_context = lineUpToCursor.match(regex_context); // example match: "{{context.tables.table1.columns.customer_id"
	
    if (lineUpToCursor.includes('{{')) {
		let currentState;
		if (match_state) {
			const categoryName = match_state[1]; // tables or widgets
			const groupName = match_state[2]; // table1, widget1
	
			if (groupName) { // checks if groupName is present, if so recommend items
				currentState = directoryStructure.state[categoryName][groupName];
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			}
			else if (categoryName) { // checks if categoryName is present, if so recommend groupNames
				currentState = directoryStructure.state[categoryName]; 
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item
						});
					});
				}
			}  
			else { // recommend category names
				currentState = directoryStructure.state;
				Object.keys(currentState).forEach(key => {
					suggestions.push({
						label: key,
						kind: monacoLib.languages.CompletionItemKind.Property,
						insertText: key,
					});
				});
			}  	
		} 
		
		else if (match_context) {
			const categoryName = match_context[1]; // tables or widgets
			const groupName = match_context[2]; // table1, widget1
			const subGroupName = match_context[3]; // columns or components
			const itemName = match_context[4]; // column names or individual components
			
			if (itemName) { // check if itemName is present, if so recommend properties (visible, editable)
				currentState = directoryStructure.context[categoryName][groupName][subGroupName][itemName];
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			}
			else if (subGroupName) { // check if subGroupName is present, if so recommend itemNames
				currentState = directoryStructure.context[categoryName][groupName][subGroupName];
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			}
			else if (groupName) { // check if groupName is present, if so recommend subGroupNames
				currentState = directoryStructure.context[categoryName][groupName];
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			}
			else if (categoryName) { // check if categoryName is present, if so recommend groupNames
				currentState = directoryStructure.context[categoryName]; 
				if (currentState) {
					Object.keys(currentState).forEach(item => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			}  
			else { // recomend categoryNames
				currentState = directoryStructure.context;
				Object.keys(currentState).forEach(key => {
					suggestions.push({
						label: key,
						kind: monacoLib.languages.CompletionItemKind.Property,
						insertText: key,
					});
				});
			} 			
		}

		else {
			currentState = directoryStructure;
			Object.keys(currentState).forEach(key => {
				suggestions.push({
					label: key,
					kind: monacoLib.languages.CompletionItemKind.Property,
					insertText: key,
				});
			});

		}

		return suggestions
    }

	if (prevWord?.toUpperCase() === 'FROM') {
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

		// also populate table in default schema
		Object.keys(completionData[databaseSchema.metadata.default_schema]).forEach((table) => {
			if (table.startsWith(cleanedCurrentWord)) {
				suggestions.push({
					label: table,
					kind: CompletionItemKind.Property,
					insertText: table,
					detail: `schema: ${databaseSchema.metadata.default_schema}`,
				});
			}
		});

		return suggestions;
	}

	if (prevWord?.toUpperCase() !== 'AS' || !prevPrevWord) {
		// if not an alias or a select table, only offer keyword completions
		return SQL_KEYWORDS.filter((word) => word.includes(cleanedCurrentWord.toUpperCase())).map(
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
				if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord === col) {
					suggestions.push({
						label: `${schema}.${table}.${col}`,
						kind: CompletionItemKind.Property,
						insertText: `${schema}.${table}.${col}`,
					});
				}
			});
		});
	});

	// do the same for the default schema
	Object.keys(completionData[databaseSchema.metadata.default_schema]).forEach((table) => {
		completionData[databaseSchema.metadata.default_schema][table].forEach((col) => {
			if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord === col) {
				suggestions.push({
					label: `${table}.${col}`,
					kind: CompletionItemKind.Property,
					insertText: `${table}.${col}`,
					detail: `schema: ${databaseSchema.metadata.default_schema}`,
				});
			}
		});
	});

	if (curTable) {
		completionData[curSchema][curTable].forEach((col) => {
			if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord === col) {
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
				if (prevPrevWord.endsWith(`.${col}`) || prevPrevWord === col) {
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
	databaseSchema: CompletionData,
	directoryStructure: any
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
			databaseSchema,
			directoryStructure,
		) as monacoLib.languages.CompletionItem[],
	};
};
