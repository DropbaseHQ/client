import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
	Box,
	Button,
	ButtonGroup,
	Center,
	Icon,
	Skeleton,
	Stack,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { Code, Table, Box as BoxIcon } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { NewFile } from './NewFile';
import { FunctionEditor } from './FunctionEditor';
import { SQLEditor } from './SQLEditor';
import { useGetPage } from '@/features/page';
import { DeleteFile } from './DeleteFile';

const componentsMap: any = {
	function: FunctionEditor,
	sql: SQLEditor,
};

const FileButton = ({ file }: any) => {
	const [devTab, setDevTab] = useAtom(developerTabAtom);
	const { isOpen: mouseOver, onClose, onOpen } = useDisclosure();

	const isSQLFile = file.type === 'sql';
	const fileName = `${file.name}${isSQLFile ? '.sql' : '.py'}`;
	const isActive = file.id === devTab.id;

	const colorScheme = isSQLFile ? 'teal' : 'purple';

	let icon = Code;

	switch (file.type) {
		case 'data_fetcher':
		case 'sql':
			icon = Table;
			break;
		case 'ui':
			icon = BoxIcon;
			break;
		default:
	}

	return (
		<Button
			onMouseEnter={onOpen}
			onMouseLeave={onClose}
			onMouseOver={onOpen}
			color=""
			variant={isActive ? 'solid' : 'outline'}
			onClick={() => {
				setDevTab({
					type: isSQLFile ? 'sql' : 'function',
					id: file.id,
				});
			}}
			key={file.id}
		>
			<Stack alignItems="center" direction="row">
				{mouseOver ? (
					<DeleteFile
						w="fit-content"
						id={file.id}
						name={fileName}
						type={isSQLFile ? 'sql' : 'py'}
					/>
				) : (
					<Icon color={isActive ? `${colorScheme}.500` : ''} as={icon} boxSize={4} />
				)}
				<Box>{file.name}</Box>
				<Box fontSize="2xs" px="1" borderRadius="sm" bg={`${colorScheme}.200`}>
					{isSQLFile ? '.sql' : '.py'}
				</Box>
			</Stack>
		</Button>
	);
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
				overflow="auto"
			>
				<ButtonGroup colorScheme="gray" isAttached size="sm">
					{(files || []).map((f: any) => {
						return <FileButton file={f} key={f.id} />;
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
