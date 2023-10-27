import {
	Button,
	ButtonGroup,
	Code,
	FormControl,
	FormLabel,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, X, Save } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useRunSQLQuery, useSaveSql, useSources } from '@/features/app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/app-state';
import { logBuilder } from '@/features/app-builder/utils';
import { ChakraTable } from '@/components/Table';
import { pageAtom } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';

export const SQLEditor = ({ id }: any) => {
	const sqlName = id.split('/').pop();
	const { pageName, appName } = useAtomValue(pageAtom);

	const [selectedSource, setSource] = useState();

	const { isLoading, code: defaultCode } = useFile({
		pageName,
		appName,
		fileName: sqlName,
	});

	const [code, setCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const { sources, isLoading: isLoadingSources } = useSources();

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const runMutation = useRunSQLQuery({
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
			setLog(null);
			setPreviewData(null);
		},
	});
	const saveSQLMutation = useSaveSql();

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			pageState,
			fileName: sqlName,
			fileContent: code,
		});
	};
	const handleSave = () => {
		saveSQLMutation.mutate({
			pageName,
			appName,
			fileName: sqlName,
			sql: code,
		});
	};

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
	};

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode]);

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
		<Stack p="3" spacing="3">
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
			<MonacoEditor value={code} onChange={setCode} language="sql" />
			<ButtonGroup variant="outline" size="sm" isAttached>
				<Button
					w="fit-content"
					isLoading={runMutation.isLoading}
					onClick={handleRun}
					isDisabled={!selectedSource}
					leftIcon={<Play size="14" />}
				>
					Run Query
				</Button>
				<Button
					w="fit-content"
					isLoading={saveSQLMutation.isLoading}
					onClick={handleSave}
					leftIcon={<Save size="14" />}
				>
					Save SQL
				</Button>
			</ButtonGroup>

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
				<ChakraTable {...previewData} maxH="md" borderRadius="sm" />
			) : null}
		</Stack>
	);
};
