import { useEffect } from 'react';
import { Box, Button, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';

import { fetchersAtom } from '../atoms/tableContextAtoms';

import { usePythonEditor } from '@/components/Editor';
import { useGetApp } from '@/features/app/hooks';

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
	const [fetchers, setFetchers] = useAtom(fetchersAtom);
	const { appId } = useParams();
	const { fetchers: savedFetchers } = useGetApp(appId || '');

	useEffect(() => {
		if (savedFetchers && savedFetchers.length > 0) {
			const formattedFetchers = savedFetchers.reduce((acc: any, curr: any) => {
				acc[curr.id] = curr.code;
				return acc;
			}, {});

			setFetchers(formattedFetchers);
		}
	}, [savedFetchers, setFetchers]);

	const createNewFetcher = () => {
		// let rand_str = (Math.random() + 1).toString(36).substring(7);
		const newUUID = crypto.randomUUID();
		setFetchers({
			...fetchers,
			[`${newUUID}`]: `# some comment ${newUUID}`,
		});
	};

	return (
		<Stack h="full" bg="gray.50" minH="full" overflowY="auto" spacing="4">
			{Object.keys(fetchers).map((fetchId: any) => {
				return (
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
				);
			})}

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
