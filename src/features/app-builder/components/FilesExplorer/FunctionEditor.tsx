import { Box, Button, Divider, IconButton, Skeleton, Stack, Text } from '@chakra-ui/react';

import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RotateCw, Save } from 'react-feather';
import { debounce } from 'lodash';
import { useQueryClient } from 'react-query';
import { useToast } from '@/lib/chakra-ui';

import { usePythonEditor } from '@/components/Editor';
import { useFile, useSaveCode } from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';

import { getErrorMessage } from '@/utils';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { FunctionTerminal } from './FunctionTerminal';

import { previewCodeAtom } from '../../atoms';

const PythonEditorLSP = ({ code: defaultCode, filePath, updateCode, name, onSave }: any) => {
	const [code, setCode] = useState(defaultCode);

	const editorRef = usePythonEditor({
		filepath: filePath,
		code,
		onChange: (newValue) => {
			setCode(newValue);
			updateCode(newValue);
		},
		onSave,
	});

	return (
		<Stack h="full" spacing="0" direction="row">
			<Box
				data-cy={`code-editor-${name}`}
				ref={editorRef}
				pt="2"
				borderLeftWidth="1px"
				flex="1"
				h="full"
				as="div"
				w="full"
			/>
		</Stack>
	);
};

export const FunctionEditor = ({ name }: any) => {
	const queryClient = useQueryClient();
	const toast = useToast();
	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });

	const file = files.find((f: any) => f.name === name);
	const fileName = file ? `${file?.name}.py` : null;

	const setPreviewFile = useSetAtom(previewCodeAtom);

	// ⚠️ check using / else will take files which ends with the same keywords like activate.py & deactivate.py
	const { code, refetch, isRefetching } = useFile({
		pageName,
		appName,
		fileName,
	});

	const [updatedCode, setCode] = useState(code || '');

	const savePythonMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated code',
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update code',
				description: getErrorMessage(error),
			});
		},
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const refetchMethods = useCallback(
		debounce(() => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		}, 2500),
		[],
	);

	useEffect(() => {
		if (code !== updatedCode) {
			refetchMethods();
		}
	}, [refetchMethods, updatedCode, code]);

	const handleSave = () => {
		savePythonMutation.mutate({
			pageName,
			appName,
			fileName: name,
			code: updatedCode,
			fileType: file?.type,
		});
	};

	useEffect(() => {
		setCode(code);
	}, [name, code]);

	useEffect(() => {
		setPreviewFile({
			name,
			code: updatedCode,
			execute: false,
		});
	}, [updatedCode, name, setPreviewFile]);

	const refetchColumns = () => {
		handleSave();
		queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
	};

	return (
		<Stack h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			<Stack p="2" direction="row" alignItems="center" justifyContent="space-between">
				<Text fontSize="md" fontWeight="semibold">
					{/* TODO: AZ style these better */}
					{file.title} ({fileName})
				</Text>

				<Stack alignItems="center" direction="row">
					<IconButton
						aria-label="Reload file"
						flexShrink="0"
						colorScheme="gray"
						size="sm"
						variant="outline"
						icon={<RotateCw size={12} />}
						onClick={() => {
							refetch();
						}}
						isLoading={isRefetching}
					/>
					<Button
						w="fit-content"
						onClick={refetchColumns}
						variant="outline"
						isLoading={savePythonMutation.isLoading}
						colorScheme="gray"
						size="sm"
						isDisabled={code === updatedCode}
						leftIcon={<Save size="14" />}
					>
						Update
					</Button>
				</Stack>
			</Stack>

			<Box overflowY="auto" h="full">
				{isRefetching ? (
					<Skeleton startColor="gray.100" endColor="gray.400" h="full" />
				) : (
					<>
						<PythonEditorLSP
							code={code}
							name={name}
							updateCode={setCode}
							key={name}
							onSave={handleSave}
						/>

						<FunctionTerminal />
					</>
				)}
			</Box>
		</Stack>
	);
};
