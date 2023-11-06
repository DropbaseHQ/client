import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, ButtonGroup, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Code, Table } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { NewFile } from './NewFile';
import { FunctionEditor } from './FunctionEditor';
import { SQLEditor } from './SQLEditor';
import { useGetPage } from '@/features/page';
import { EditFile } from '@/features/app-builder/components/FilesExplorer/EditFile';

const componentsMap: any = {
	function: FunctionEditor,
	sql: SQLEditor,
};

export const FilesExplorer = () => {
	const { pageId } = useParams();
	const { files, isLoading, error } = useGetPage(pageId);

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
						const isSQLFile = f.name.endsWith('.sql');
						return (
							<Button
								variant={f.id === devTab.id ? 'solid' : 'outline'}
								onClick={() => {
									setDevTab({
										type: isSQLFile ? 'sql' : 'function',
										id: f.id,
									});
								}}
								leftIcon={isSQLFile ? <Table size="14" /> : <Code size="14" />}
								key={f.id}
							>
								<Stack alignItems="center" direction="row">
									<Box>{f.name}</Box>
									{f.id === devTab.id ? <EditFile file={f} /> : null}
								</Stack>
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
