import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Box, Button, ButtonGroup, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Code, Table } from 'react-feather';
import { useMonacoLoader } from '@/components/Editor';
import { usePageFiles } from '@/features/new-app-builder/hooks';

import { developerTabAtom } from '@/features/new-app-builder/atoms';

import { NewFile } from './NewFile';
import { FunctionEditor } from './FunctionEditor';
import { SQLEditor } from './SQLEditor';
import { pageAtom } from '@/features/new-page';

const componentsMap: any = {
	function: FunctionEditor,
	sql: SQLEditor,
};

export const FilesExplorer = () => {
	const { pageName, appName } = useAtomValue(pageAtom);
	const { files, isLoading, error } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const isReady = useMonacoLoader();

	const [devTab, setDevTab] = useAtom(developerTabAtom);

	useEffect(() => {
		return () => {
			setDevTab({
				type: null,
				id: null,
			});
		};
	}, [setDevTab]);

	if (!isReady || isLoading) {
		return <Skeleton />;
	}

	if (error) {
		return <Box>{JSON.stringify(error)}</Box>;
	}

	const Component = componentsMap[devTab.type];

	return (
		<Stack spacing="0" h="full">
			<Stack
				p="2"
				position="sticky"
				top="0"
				spacing="4"
				borderBottomWidth="1px"
				bg="white"
				h="55px"
				alignItems="center"
				direction="row"
			>
				<ButtonGroup isAttached size="sm">
					{(files || []).map((f: any) => {
						const isSQLFile = f.endsWith('.sql');
						return (
							<Button
								variant={f === devTab.id ? 'solid' : 'outline'}
								onClick={() => {
									setDevTab({
										type: isSQLFile ? 'sql' : 'function',
										id: f,
									});
								}}
								leftIcon={isSQLFile ? <Table size="14" /> : <Code size="14" />}
								key={f}
							>
								{f.split('/').pop()}
							</Button>
						);
					})}
					<NewFile variant="outline" />
				</ButtonGroup>
			</Stack>

			<Box h="calc(100% - 55px)" overflowX="hidden" overflowY="auto">
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
		</Stack>
	);
};
