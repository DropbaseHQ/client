import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	Divider,
	Skeleton,
	SkeletonCircle,
	Stack,
} from '@chakra-ui/react';

import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Save } from 'react-feather';
import { useQueryClient } from 'react-query';

import { useParams } from 'react-router-dom';
import { usePythonEditor } from '@/components/Editor';
import { COLUMN_PROPERTIES_QUERY_KEY, useFile, usePageFiles } from '@/features/app-builder/hooks';
import { pageAtom, useGetPage } from '@/features/page';

import { FunctionTerminal } from './FunctionTerminal';
import { TABLE_DATA_QUERY_KEY } from '../../../smart-table/hooks';
import { findFunctionDeclarations } from '../../utils';

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
	const queryClient = useQueryClient();
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

	const refetchColumns = () => {
		queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
	};

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

	const functionDeclarations = findFunctionDeclarations(updatedCode);

	const isNotSameFunctionName =
		file?.type === 'data_fetcher' || file?.type === 'ui'
			? !functionDeclarations.find((f) => f.name === file.name)
			: false;

	return (
		<Stack h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			{file?.type === 'data_fetcher' ? (
				<Stack p="2" direction="row" alignItems="center" justifyContent="end">
					<Button
						w="fit-content"
						onClick={refetchColumns}
						variant="outline"
						colorScheme="gray"
						size="sm"
						leftIcon={<Save size="14" />}
					>
						Update
					</Button>
				</Stack>
			) : null}

			{isNotSameFunctionName ? (
				<Alert status="error">
					<AlertIcon />

					<AlertDescription>
						Please make sure function name matches with the file name
					</AlertDescription>
				</Alert>
			) : null}
			<Box pt="2">
				<PythonEditorLSP code={code} updateCode={setCode} filePath={filePath} key={id} />
			</Box>
			<FunctionTerminal file={file} code={updatedCode} />
		</Stack>
	);
};
