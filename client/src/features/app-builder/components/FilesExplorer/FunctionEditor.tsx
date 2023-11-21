import { Box, Divider, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import { usePythonEditor } from '@/components/Editor';
import { useFile, usePageFiles } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage } from '@/features/page';

import { FunctionTerminal } from './FunctionTerminal';

const PythonEditorLSP = ({ code: defaultCode, filePath, updateCode }: any) => {
	const [code, setCode] = useState(defaultCode);

	const editorRef = usePythonEditor({
		filepath: filePath,
		code,
		onChange: (newValue) => {
			setCode(newValue);
			updateCode(newValue);
		},
	});

	return <Box ref={editorRef} as="div" w="full" />;
};

export const FunctionEditor = ({ id }: any) => {
	const { pageName, appName } = useAtomValue(pageAtom);

	const { pageId } = useParams();
	const { files } = useGetPage(pageId);

	const { files: workerFiles, isLoading: isLoadingWorkerFiles } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const file = files.find((f: any) => f.id === id);
	const fileName = file ? `${file?.name}${file?.type === 'sql' ? '.sql' : '.py'}` : null;

	const filePath = workerFiles.find((f: any) => f.endsWith(fileName));
	const { isLoading, code } = useFile({
		pageName,
		appName,
		fileName,
	});

	const [updatedCode, setCode] = useState(code || '');

	useEffect(() => {
		setCode(code);
	}, [id, code]);

	if (isLoading || isLoadingWorkerFiles) {
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
		<Stack py="2" h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			<PythonEditorLSP code={code} updateCode={setCode} filePath={filePath} key={id} />
			<FunctionTerminal file={file} code={updatedCode} />
		</Stack>
	);
};
