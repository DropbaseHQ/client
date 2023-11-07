import { Box, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { useParams } from 'react-router-dom';
import { usePythonEditor } from '@/components/Editor';
import { useFile, usePageFiles } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage } from '@/features/page';
import { DeleteFile } from './DeleteFile';
import { FunctionTerminal } from './FunctionTerminal';

const PythonEditorLSP = ({ code: defaultCode, filePath }: any) => {
	const [code, setCode] = useState(defaultCode);

	const editorRef = usePythonEditor({
		filepath: filePath,
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});

	return <Box ref={editorRef} as="div" w="full" />;
};

export const FunctionEditor = ({ id }: any) => {
	const { pageName, appName } = useAtomValue(pageAtom);

	const { pageId } = useParams();
	const { files } = useGetPage(pageId);

	const file = files.find((f: any) => f.id === id);
	const functionName = file.name;

	const { files: workerFiles, isLoading: isLoadingWorkerFiles } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const filePath = workerFiles.find((f: any) => f.endsWith(functionName));
	const { isLoading, code } = useFile({
		pageName,
		appName,
		fileName: `${functionName}${file?.type === 'sql' ? '.sql' : '.py'}`,
	});

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
		<Stack p="3" w="full" spacing="2">
			<PythonEditorLSP code={code} filePath={filePath} key={id} />

			<DeleteFile w="fit-content" id={id} name={functionName} />

			<FunctionTerminal file={file} />
		</Stack>
	);
};
