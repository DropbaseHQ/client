import { Box, Code } from '@chakra-ui/react';
import { useMonaco } from '@monaco-editor/react';

import { useAtom } from 'jotai';

import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { BG_UNFOCUSED } from '@/utils/constants';
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
		<Box w="full" overflowY="auto" h="full" maxH="full" backgroundColor={BG_UNFOCUSED}>
			<Code w="full" backgroundColor="inherit" padding="1rem">
				<pre>{state}</pre>
			</Code>
		</Box>
	);
};
