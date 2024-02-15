import * as monacoLib from 'monaco-editor';

type CompletionSuggestion = Omit<monacoLib.languages.CompletionItem, 'range'>;

export const buildTemplateStringSuggestions = (
	lineUpToCursor: string,
	directoryStructure: any,
): CompletionSuggestion[] => {
	const suggestions: CompletionSuggestion[] = [];

	const regexState = /{{state(?:\.([^{}.]+))?(?:\.([^{}.]+))?/; // checks for strings that start with '{{state', and match up to two levels of dot-separated identifiers
	const matchState = lineUpToCursor.match(regexState); // example match: "{{state.tables.table1"

	const regexContext =
		/{{context(?:\.([^{}.]+))?(?:\.([^{}.]+))?(?:\.([^{}.]+))?(?:\.([^{}.]+))?/; // checks for strings that start with '{{context', and match up to four levels of dot-separated identifiers
	const matchContext = lineUpToCursor.match(regexContext); // example match: "{{context.tables.table1.columns.customer_id"

	if (lineUpToCursor.includes('{{')) {
		let currentState;
		if (matchState) {
			const categoryName = matchState[1]; // tables or widgets
			const groupName = matchState[2]; // table1, widget1

			if (groupName) {
				// checks if groupName is present, if so recommend items
				currentState = directoryStructure.state[categoryName][groupName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else if (categoryName) {
				// checks if categoryName is present, if so recommend groupNames
				currentState = directoryStructure.state[categoryName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else {
				// recommend category names
				currentState = directoryStructure.state;
				Object.keys(currentState).forEach((key) => {
					suggestions.push({
						label: key,
						kind: monacoLib.languages.CompletionItemKind.Property,
						insertText: key,
					});
				});
			}
		} else if (matchContext) {
			const categoryName = matchContext[1]; // tables or widgets
			const groupName = matchContext[2]; // table1, widget1
			const subGroupName = matchContext[3]; // columns or components
			const itemName = matchContext[4]; // column names or individual components

			if (itemName) {
				// check if itemName is present, if so recommend properties (visible, editable)
				currentState =
					directoryStructure.context[categoryName][groupName][subGroupName][itemName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else if (subGroupName) {
				// check if subGroupName is present, if so recommend itemNames
				currentState = directoryStructure.context[categoryName][groupName][subGroupName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else if (groupName) {
				// check if groupName is present, if so recommend subGroupNames
				currentState = directoryStructure.context[categoryName][groupName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else if (categoryName) {
				// check if categoryName is present, if so recommend groupNames
				currentState = directoryStructure.context[categoryName];
				if (currentState) {
					Object.keys(currentState).forEach((item) => {
						suggestions.push({
							label: item,
							kind: monacoLib.languages.CompletionItemKind.Property,
							insertText: item,
						});
					});
				}
			} else {
				// recomend categoryNames
				currentState = directoryStructure.context;
				Object.keys(currentState).forEach((key) => {
					suggestions.push({
						label: key,
						kind: monacoLib.languages.CompletionItemKind.Property,
						insertText: key,
					});
				});
			}
		} else {
			currentState = directoryStructure;
			Object.keys(currentState).forEach((key) => {
				suggestions.push({
					label: key,
					kind: monacoLib.languages.CompletionItemKind.Property,
					insertText: key,
				});
			});
		}

		return suggestions;
	}

	return [];
};

export const provideTemplateItems = (
	model: monacoLib.editor.ITextModel,
	position: monacoLib.Position,
	directoryStructure: any,
) => {
	const lineUpToPosition = model.getValueInRange({
		startLineNumber: position.lineNumber,
		startColumn: 1,
		endLineNumber: position.lineNumber,
		endColumn: position.column,
	});
	return {
		suggestions: buildTemplateStringSuggestions(
			lineUpToPosition,
			directoryStructure,
		) as monacoLib.languages.CompletionItem[],
	};
};
