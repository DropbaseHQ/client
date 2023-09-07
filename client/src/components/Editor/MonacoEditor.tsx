import Editor, { useMonaco } from '@monaco-editor/react';
import { useMonacoTheme } from './hooks/useMonacoTheme';

export const MonacoEditor = (props: any) => {
	const monaco = useMonaco();
	useMonacoTheme(monaco);

	return <Editor {...props} />;
};
