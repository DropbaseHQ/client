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
import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import { usePageFunction, useUpdateFunction } from '@/features/new-app-builder/hooks';

export const FunctionEditor = ({ id }: any) => {
	const { isLoading, code: defaultCode, name, refetch } = usePageFunction(id || '');

	const mutation = useUpdateFunction({
		onSuccess: () => {
			refetch();
		},
	});

	const [code, setCode] = useState('');

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode]);

	const handleSave = () => {
		mutation.mutate({
			functionId: id,
			code,
			name,
		});
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
					/>
				</InputLeftElement>
				<Input
					fontFamily="mono"
					border="0"
					type="text"
					fontSize="sm"
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
							isLoading={mutation.isLoading}
							aria-label="Save code"
						/>
					</InputRightElement>
				) : null}
			</InputGroup>
		</Stack>
	);
};
