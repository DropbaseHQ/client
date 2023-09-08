import {
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Skeleton,
	Stack,
} from '@chakra-ui/react';
import { Play, Save } from 'react-feather';
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

export const FunctionEditor = ({ id }: any) => {
	const { pageId } = useParams();
	const { isLoading, code: defaultCode, name, refetch } = usePageFunction(id || '');

	const [action, setAction] = useState('');

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const updateMutation = useUpdateFunction({
		onSuccess: () => {
			refetch();
		},
	});

	const runMutation = useRunFunction({
		onSuccess: (data: any) => {
			syncState(data);
		},
	});

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
		</Stack>
	);
};
