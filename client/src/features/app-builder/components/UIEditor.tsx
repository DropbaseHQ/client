import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { usePythonEditor } from '@/components/Editor';

export const UIEditor = () => {
	const [code, setCode] = useState('# some comment');

	const editorRef = usePythonEditor({
		filepath: 'uiComponent.py',
		code,
		onChange: setCode,
	});

	return <Box ref={editorRef} as="div" w="full" h="full" />;
};
