import { Box } from '@chakra-ui/react';

import { usePythonEditor } from '@/components/editor';

export const UIEditor = ({ code, setCode }: { code: any; setCode: any }) => {
	const editorRef = usePythonEditor({
		filepath: 'uiComponent.py',
		code,
		onChange: setCode,
	});

	return <Box ref={editorRef} as="div" w="full" h="full" />;
};
