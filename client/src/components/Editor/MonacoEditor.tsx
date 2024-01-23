import { useCallback, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useMonacoTheme } from './hooks/useMonacoTheme';

export const MonacoEditor = (props: any) => {
	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const { onMount, height: defaultHeight, options, ...otherProps } = props;
	const lineHeight = 30; // Assuming a single line height of 30 pixels
    const [height, setHeight] = useState(defaultHeight || lineHeight);

	const handleEditorMount = useCallback(
		(editor: any, ...rest: any) => {
            editor.onDidContentSizeChange((event: any) => {
                const editorHeight = event.contentHeight;
                setHeight(editorHeight); // Dynamically adjust height based on content
                editor.layout();
            });

			if (onMount) {
				onMount(editor, ...rest);
			}
		},
		[onMount],
	);

	return (
		<Editor
			{...otherProps}
			options={{
				folding: false,
				lineNumbersMinChars: 3,
				...(options || {}),

				glyphMargin: false,
				lightbulb: {
					enabled: true,
				},
				overviewRulerBorder: false,
				overviewRulerLanes: 0,
				automaticLayout: true,
				scrollBeyondLastLine: false,
				minimap: {
					enabled: false,
				},
				fontFamily: 'Fira Code',
				fontSize: 12,
				scrollbar: {
					verticalHasArrows: true,
					alwaysConsumeMouseWheel: false,
					vertical: 'auto',
					horizontal: 'auto',
				},
			}}
			onMount={handleEditorMount}
            height={height}
		/>
	);
};
