import { Box, Button, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import * as monaco from 'monaco-editor';
import { Save, RotateCw } from 'react-feather';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useSaveCode } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { previewCodeAtom } from '../../atoms';

export const CodeEditor = ({ name }: any) => {
	const toast = useToast();
	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });

	const file = files.find((f: any) => f.name === name);
	const fileName = file?.name;

	const fullFileName = file ? `${fileName}.${file?.type}` : null;
	const {
		isLoading,
		code: defaultCode,
		refetch,
		isRefetching,
	} = useFile({
		pageName,
		appName,
		fileName: fullFileName,
	});

	const setPreviewFile = useSetAtom(previewCodeAtom);

	const [code, setCode] = useState('');

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode, name]);

	useEffect(() => {
		setPreviewFile({
			name,
			code,
		});

		return () => {
			setPreviewFile({
				name: null,
				code: null,
			});
		};
	}, [name, code, setPreviewFile]);

	const saveCodeMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: `Updated ${fileName}`,
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: `Failed to update ${fileName}`,
				description: getErrorMessage(error),
			});
		},
	});

	const handleSave = () => {
		if (code) {
			saveCodeMutation.mutate({
				pageName,
				appName,
				fileName,
				code,

				fileType: file?.type,
			});
		} else {
			toast({
				status: 'error',
				title: 'Empty code is not allowed',
			});
		}
	};

	const onSaveRef = useRef(handleSave);
	onSaveRef.current = handleSave;

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

	const handleMount = (editor: any) => {
		// eslint-disable-next-line no-bitwise
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSaveRef?.current?.();
		});
	};

	const stringifiedCode = typeof code === 'object' ? JSON.stringify(code, null, 4) : code;

	return (
		<Stack bg="white" h="full" overflowY="auto" overflowX="hidden" spacing="0">
			<Stack spacing="3">
				<Stack
					p="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Text fontSize="md" fontWeight="semibold">
						{/* TODO: AZ style these better */}
						{file.title} ({fullFileName})
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
							isLoading={saveCodeMutation.isLoading}
							onClick={handleSave}
							variant="outline"
							colorScheme="gray"
							size="sm"
							isDisabled={!code || code === defaultCode}
							leftIcon={<Save size="14" />}
						>
							Update
						</Button>
					</Stack>
				</Stack>
			</Stack>
			<Stack h="full" spacing="0" direction="row">
				<Box h="full" pt="2" w="full" borderLeftWidth="1px">
					<MonacoEditor
						value={stringifiedCode}
						onMount={handleMount}
						onChange={setCode}
						language={file.type}
					/>
				</Box>
			</Stack>
		</Stack>
	);
};
