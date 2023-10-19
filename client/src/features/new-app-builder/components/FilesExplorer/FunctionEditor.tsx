import {
	Box,
	Button,
	Code,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { usePythonEditor } from '@/components/Editor';
import { useFile, useRunTableQuery } from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import { logBuilder } from '@/features/new-app-builder/utils';
import { DeleteFunction } from '@/features/new-app-builder/components/FilesExplorer/DeleteFunction';
import { ChakraTable } from '@/components/Table';
import { pageAtom } from '@/features/new-page';

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

	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
	};

	const runMutation = useRunTableQuery({
		onSuccess: (data: any) => {
			syncState(data);
			setLog(logBuilder(data));

			if (data?.result?.columns) {
				setPreviewData({
					rows: data?.result?.data || [],
					columns: data?.result?.columns || [],
				});
			}
		},
		onMutate: () => {
			resetRunData();
		},
	});

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			pageState,
			fileName: functionName,
			type: 'python',
		});
	};

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

			<Stack direction="row" justifyContent="space-between">
				<Button
					variant="outline"
					size="sm"
					isLoading={runMutation.isLoading}
					onClick={handleRun}
					leftIcon={<Play size="14" />}
					aria-label="Run code"
					w="fit-content"
				>
					Run Function
				</Button>
				<DeleteFunction
					w="fit-content"
					variant="outline"
					functionId={id}
					functionName={functionName}
				/>
			</Stack>

			{log ? (
				<Stack bg="white" p="2" h="full" borderRadius="sm">
					<Stack direction="row" alignItems="start">
						<IconButton
							aria-label="Close output"
							size="xs"
							colorScheme="gray"
							variant="outline"
							borderRadius="full"
							icon={<X size={14} />}
							onClick={resetRunData}
						/>

						<Stack>
							<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
								Output
							</Text>
							<Code
								w="full"
								color="gray.500"
								backgroundColor="inherit"
								overflow="auto"
								height={`${(log?.split('\n').length || 1) * 24}px`}
							>
								<pre>{log}</pre>
							</Code>
						</Stack>
					</Stack>
				</Stack>
			) : null}

			{previewData?.columns ? (
				<ChakraTable {...previewData} maxH="sm" borderRadius="sm" />
			) : null}
		</Stack>
	);
};
