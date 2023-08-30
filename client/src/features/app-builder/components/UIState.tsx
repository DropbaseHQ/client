import { Box } from '@chakra-ui/react';
import Editor, { useMonaco } from '@monaco-editor/react';

import { useAtom } from 'jotai';

import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

export const UIState = () => {
	const [userInput] = useAtom(userInputAtom);
	const [selectedRow] = useAtom(selectedRowAtom);

	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const builderContext = {
		userInput,
		selectedRow,
	};

	const state = JSON.stringify(builderContext, null, 4);

	return (
		<Box w="full" overflowY="auto" h="full" maxH="full" backgroundColor="bg-canvas">
			<Editor
				options={{
					// readOnly: true,
					minimap: { enabled: false },
					overviewRulerLanes: 0,
					scrollbar: {
						vertical: 'auto',
						horizontal: 'auto',
						verticalHasArrows: true,
						alwaysConsumeMouseWheel: false,
					},

					automaticLayout: true,
					scrollBeyondLastLine: false,
				}}
				height="100%"
				language="json"
				value={state}
			/>
		</Box>
	);
};
