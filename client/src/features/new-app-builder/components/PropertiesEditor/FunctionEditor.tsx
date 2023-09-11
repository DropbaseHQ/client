import {
	Code,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Skeleton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, Save, X } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import {
	usePageFunction,
	useRunFunction,
	useUpdateFunction,
} from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import { logBuilder } from '@/features/new-app-builder/utils';

export const FunctionEditor = ({ id }: any) => {
	const { pageId } = useParams();
	const { isLoading, code: defaultCode, name, refetch } = usePageFunction(id || '');

	const [action, setAction] = useState('');
	const [log, setLog] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const updateMutation = useUpdateFunction({
		onSuccess: () => {
			refetch();
		},
	});

	const runMutation = useRunFunction({
		onSuccess: (data: any) => {
			if (data.status === 'success') {
				syncState(data.result);
			}

			setLog(logBuilder(data));
		},
		onMutate: () => {
			setLog(null);
		},
	});

	console.log(runMutation.data);

	const [code, setCode] = useState('');

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode]);

	const handleSave = () => {
		updateMutation.mutate({
			functionId: id,
			code,
			name,
		});
	};

	const handleRun = () => {
		runMutation.mutate({ pageId, pageState, action });
	};

	if (isLoading) {
		return <Skeleton h="xs" />;
	}

	return (
		<Stack spacing="1">
			<MonacoEditor height="250px" language="python" value={code} onChange={setCode} />

			<InputGroup>
				<InputLeftElement>
					<IconButton
						icon={<Play size="14" />}
						variant="ghost"
						colorScheme="gray"
						aria-label="Run code"
						isLoading={runMutation.isLoading}
						onClick={handleRun}
					/>
				</InputLeftElement>
				<Input
					fontFamily="mono"
					border="0"
					type="text"
					fontSize="sm"
					value={action}
					onChange={(e) => {
						setAction(e.target.value);
					}}
					borderRadius="4px"
					placeholder="Write function call here"
				/>

				{defaultCode !== code ? (
					<InputRightElement>
						<IconButton
							icon={<Save size="14" />}
							variant="ghost"
							colorScheme="blue"
							onClick={handleSave}
							isLoading={updateMutation.isLoading}
							aria-label="Save code"
						/>
					</InputRightElement>
				) : null}
			</InputGroup>

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
							onClick={() => setLog(null)}
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
		</Stack>
	);
};
