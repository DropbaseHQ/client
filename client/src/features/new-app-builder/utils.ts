import * as monacoLib from 'monaco-editor';

export const MODEL_SCHEME = 'executable';
export const MODEL_PATH = 'main.py';

export const logBuilder = (data: any) => {
	let outputPreview = '';

	if (data?.stdout && data.stdout !== '\n') {
		outputPreview = data.stdout;
	}

	if (data?.traceback) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += `---------------------------------------------------------------------------------\n`;

		outputPreview += data.traceback;
	}

	if (data?.result) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += data.result;
	}

	return outputPreview;
};

export const findFunctionDeclarations = (code: string) => {
	const functionRegex =
		/^def\s+(?<call>(?<name>\w*)\s*\((?<params>[\S\s]*?)\)(?:\s*->\s*[\S\s]+?|\s*)):/gm;
	return [...code.matchAll(functionRegex)].map((match) => match.groups);
};

export const generateFunctionCallSuggestions = (
	model: monacoLib.editor.ITextModel,
	position: monacoLib.Position,
	functions: any[],
) => {
	if (model.uri.scheme === MODEL_SCHEME && model.uri.path === MODEL_PATH) {
		const word = model.getWordUntilPosition(position);

		const range = {
			startLineNumber: position.lineNumber,
			endLineNumber: position.lineNumber,
			startColumn: word.startColumn,
			endColumn: word.endColumn,
		};

		return {
			suggestions: functions.map((f) => ({
				label: `${f.name}`,
				kind: monacoLib.languages.CompletionItemKind.Function,
				documentation: `Function call for ${f.name}`,
				insertText: `${f.call}`,
				range,
			})),
		};
	}

	return {
		suggestions: [],
	};
};
