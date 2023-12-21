import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Box, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { FunctionEditor } from './FunctionEditor';
import { SQLEditor } from './SQLEditor';
import { useGetPage } from '@/features/page';

const componentsMap: any = {
	function: FunctionEditor,
	sql: SQLEditor,
};

export const FileContent = () => {
	const { pageId } = useParams();
	const { files, isLoading, error } = useGetPage(pageId);

	const {isMonacoReady, isLSPReady} = useMonacoLoader();

	const [devTab, setDevTab] = useAtom(developerTabAtom);

	useEffect(() => {
		return () => {
			setDevTab({
				type: null,
				id: null,
			});
		};
	}, [setDevTab]);

	if (!isMonacoReady || !isLSPReady || isLoading) {
		return (
			<Stack borderBottomWidth="1px" bg="white" p="2">
				<Stack direction="row">
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
				</Stack>
			</Stack>
		);
	}

	if (error) {
		return <Box>{JSON.stringify(error)}</Box>;
	}

	const Component = componentsMap[devTab.type];

	return (
		<Box h="full" overflowX="hidden" overflowY="auto">
			{Component ? (
				<Component id={devTab.id} />
			) : (
				<Center p="4" h="full">
					<Text size="sm" fontWeight="medium">
						{files.length > 0 ? 'Select a file' : 'Create a File'}
					</Text>
				</Center>
			)}
		</Box>
	);
};
