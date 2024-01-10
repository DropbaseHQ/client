import {
	Button,
	FormControl,
	FormLabel,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Save } from 'react-feather';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useSaveCode, useSources } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { previewCodeAtom } from '../../atoms';

export const SQLEditor = ({ name }: any) => {
	const toast = useToast();
	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });

	const file = files.find((f: any) => f.name === name);
	const sqlName = file?.name;

	const [selectedSource, setSource] = useState();

	const fullFileName = file ? `${sqlName}.${file?.type}` : null;
	const {
		isLoading,
		code: defaultCode,
		refetch,
	} = useFile({
		pageName,
		appName,
		fileName: fullFileName,
	});

	const setPreviewFile = useSetAtom(previewCodeAtom);

	const [code, setCode] = useState('');

	const { sources, isLoading: isLoadingSources } = useSources();

	useEffect(() => {
		setSource(file?.source);
	}, [setSource, file]);

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode, name]);

	useEffect(() => {
		setPreviewFile({
			name,
			code,
			source: selectedSource,
			execute: false,
		});

		return () => {
			setPreviewFile({
				name: null,
				code: null,
				source: null,
				execute: false,
			});
		};
	}, [name, code, selectedSource, setPreviewFile]);

	const saveSQLMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated SQL',
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update SQL',
				description: getErrorMessage(error),
			});
		},
	});

	const handleSave = () => {
		saveSQLMutation.mutate({
			pageName,
			appName,
			fileName: sqlName,
			sql: code,
			source: selectedSource,
			fileId: name,
			fileType: file?.type,
		});
	};

	if (isLoading || isLoadingSources) {
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
		<Stack bg="white" h="full" overflowY="auto" overflowX="hidden" spacing="3">
			<Stack
				p="2"
				borderBottomWidth="1px"
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
				<Text fontSize="sm" fontWeight="semibold">
					{fullFileName}
				</Text>

				<Button
					w="fit-content"
					isLoading={saveSQLMutation.isLoading}
					onClick={handleSave}
					variant="outline"
					colorScheme="gray"
					size="sm"
					isDisabled={code === defaultCode && file?.source === selectedSource}
					leftIcon={<Save size="14" />}
				>
					Update
				</Button>
			</Stack>
			<Stack px="3" pb="3" borderBottomWidth="1px" alignItems="start" direction="row">
				<FormControl>
					<FormLabel>Source</FormLabel>
					<InputRenderer
						size="sm"
						flex="1"
						maxW="sm"
						type="select"
						placeholder="Sources"
						value={selectedSource}
						options={sources.map((s) => ({ name: s, value: s }))}
						onChange={(newSelectedSource: any) => {
							setSource(newSelectedSource);
						}}
					/>
				</FormControl>
			</Stack>

			<MonacoEditor value={code} onChange={setCode} language="sql" />
		</Stack>
	);
};
