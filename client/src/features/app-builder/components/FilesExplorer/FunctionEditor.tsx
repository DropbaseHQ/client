import { Box, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { usePythonEditor } from '@/components/Editor';
import { useFile } from '@/features/app-builder/hooks';
import { pageAtom } from '@/features/page';
import { DeleteFunction } from './DeleteFunction';
import { FunctionTerminal } from './FunctionTerminal';

const PythonEditorLSP = ({ code: defaultCode, id }: any) => {
	const [code, setCode] = useState(defaultCode);

	const editorRef = usePythonEditor({
		filepath: id,
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});

	return <Box ref={editorRef} as="div" w="full" />;
};

export const FunctionEditor = ({ id }: any) => {
	const functionName = id.split('/').pop();
	const { pageName, appName } = useAtomValue(pageAtom);

	const { isLoading, code } = useFile({
		pageName,
		appName,
		fileName: functionName,
	});

	if (isLoading) {
		return (
			<Stack p="3" spacing="2">
				<Skeleton startColor="gray.200" endColor="gray.300" h="32" />
				<Stack direction="row">
					<SkeletonCircle h="10" w="10" />
					<Skeleton startColor="gray.200" w="full" endColor="gray.300" h="10" />
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack p="3" spacing="2">
			<PythonEditorLSP code={code} id={id} key={id} />

			<DeleteFunction
				w="fit-content"
				variant="outline"
				functionId={id}
				functionName={functionName}
			/>
			<FunctionTerminal />
		</Stack>
	);
};
