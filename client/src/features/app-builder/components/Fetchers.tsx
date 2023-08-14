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

	return <Box ref={editorRef} as="div" w="full" h="250px" />;
};

export const Fetchers = () => {
	const [fetchers, setFetchers] = useState<any>([]);

	const createNewFetcher = () => {
		setFetchers((f: any) => [...f, f.length + 1]);
	};

	return (
		<Stack overflowY="auto" spacing="8">
			<FetchEditor id="default" />

			{fetchers.map((fetchId: any) => (
				<FetchEditor key={fetchId} id={fetchId} />
			))}

			<Button size="sm" onClick={createNewFetcher}>
				Create new fetcher
			</Button>
		</Stack>
	);
};
