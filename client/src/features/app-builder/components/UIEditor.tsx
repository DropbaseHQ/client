import { Box } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { usePythonEditor } from '@/components/Editor';
import { uiCodeAtom } from '../atoms/tableContextAtoms';

export const UIEditor = () => {
	const [code, setCode] = useAtom(uiCodeAtom);

	const editorRef = usePythonEditor({
		filepath: 'uiComponent.py',
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});

	return <Box ref={editorRef} as="div" w="full" h="full" />;
};
