import { useState } from 'react';
import { Box, Button, Stack } from '@chakra-ui/react';

import { usePythonEditor } from '@/components/Editor';

export const FetchEditor = ({ id, code, setCode }: { id: string; code: string; setCode: any }) => {
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
	const [fetchers, setFetchers] = useState<any>({
		default: '# some comment',
	});

	const createNewFetcher = () => {
		setFetchers({
			...fetchers,
			[`code-${Object.keys(fetchers).length}`]: `# some comment ${
				Object.keys(fetchers).length
			}`,
		});
	};

	return (
		<Stack h="full" bg="gray.50" minH="full" overflowY="auto" spacing="4">
			{Object.keys(fetchers).map((fetchId: any) => (
				<FetchEditor
					key={fetchId}
					code={fetchers[fetchId]}
					setCode={(n: any) => {
						setFetchers((f: any) => ({
							...f,
							[fetchId]: n,
						}));
					}}
					id={fetchId}
				/>
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
				justifyContent="space-between"
			>
				<Button size="sm" onClick={createNewFetcher}>
					Create new fetcher
				</Button>
				<Button
					size="sm"
					onClick={() => {
						console.log('Fetchers', fetchers);
					}}
				>
					Test console
				</Button>
			</Stack>
		</Stack>
	);
};
