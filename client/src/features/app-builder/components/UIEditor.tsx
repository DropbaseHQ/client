import { Box } from '@chakra-ui/react';
import { usePythonEditor } from '@/components/Editor';
import { useAtom } from 'jotai';
import { uiCodeAtom } from '../atoms/tableContextAtoms';

export const UIEditor = () => {
	const [code, setCode] = useAtom(uiCodeAtom);
	const editorRef = usePythonEditor({
		filepath: 'uiComponent.py',
		code,
		onChange: setCode,
	});

	return <Box ref={editorRef} as="div" w="full" h="full" />;
};
