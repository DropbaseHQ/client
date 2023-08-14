import { useState } from 'react';
import { Box, Button, Stack } from '@chakra-ui/react';

import { usePythonEditor } from '@/components/Editor';

export const FetchEditor = ({ id }: { id: string }) => {
	const [code, setCode] = useState('# some comment');

	const editorRef = usePythonEditor({
		filepath: `fetchers/${id}.py`,
		code,
		onChange: setCode,
	});

	return (
		<Box minH="2xs" borderTopWidth="1px" borderBottomWidth="1px">
			<Box ref={editorRef} as="div" w="full" h="full" />
		</Box>
	);
};

export const Fetchers = () => {
	const [fetchers, setFetchers] = useState<any>([]);

	const createNewFetcher = () => {
		setFetchers((f: any) => [...f, f.length + 1]);
	};

	return (
		<Stack h="full" bg="gray.50" minH="full" overflowY="auto" spacing="4">
			<FetchEditor id="default" />

			{fetchers.map((fetchId: any) => (
				<FetchEditor key={fetchId} id={fetchId} />
			))}

			<Stack
				mt="auto"
				position="sticky"
				bottom="0"
				bg="white"
				direction="row"
				p="2"
				alignItems="center"
				borderTopWidth="0.5px"
				justifyContent="end"
			>
				<Button size="sm" onClick={createNewFetcher}>
					Create new fetcher
				</Button>
			</Stack>
		</Stack>
	);
};
