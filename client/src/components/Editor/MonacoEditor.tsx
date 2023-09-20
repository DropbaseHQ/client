import { useCallback, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useMonacoTheme } from './hooks/useMonacoTheme';

export const MonacoEditor = (props: any) => {
	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const { onMount, height: defaultHeight, options, ...otherProps } = props;
	const [height, setHeight] = useState(defaultHeight || 16);

	const handleEditorMount = useCallback(
		(editor: any, ...rest: any) => {
			editor.onDidContentSizeChange(() => {
				try {
					setHeight(Math.min(1000, editor.getContentHeight()));
					editor.layout();
				} finally {
					//
				}
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
				minimap: { enabled: false },
				scrollbar: {
					verticalHasArrows: true,
					alwaysConsumeMouseWheel: false,
					vertical: 'auto',
					horizontal: 'auto',
				},
				fontFamily: 'Fira Code',
				fontSize: 14,
				...(options || {}),
				scrollBeyondLastLine: false,
				automaticLayout: true,
			}}
			onMount={handleEditorMount}
			height={height}
		/>
	);
};
