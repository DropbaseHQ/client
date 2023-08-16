import { Box } from '@chakra-ui/react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useAtom } from 'jotai';

import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { userInputAtom, selectedRowAtom } from '../atoms/tableContextAtoms';

export const UIState = () => {
	const monaco = useMonaco();
	const [userInput] = useAtom(userInputAtom);
	const [selectedRow] = useAtom(selectedRowAtom);
	useMonacoTheme(monaco);

	const builderContext = {
		userInput,
		selectedRow,
	};
	return (
		<Box w="full" h="full">
			<Editor
				height="100%"
				options={{ readOnly: true, minimap: { enabled: false } }}
				language="json"
				value={JSON.stringify(builderContext, null, 4)}
			/>
		</Box>
	);
};
