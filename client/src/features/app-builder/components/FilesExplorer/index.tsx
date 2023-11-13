import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
	Box,
	Button,
	ButtonGroup,
	Center,
	Icon,
	Input,
	Progress,
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
import { pageAtom, useGetPage } from '@/features/page';
import { DeleteFile } from './DeleteFile';
import { useUpdateFile } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';

const componentsMap: any = {
	function: FunctionEditor,
	sql: SQLEditor,
};

const FileButton = ({ file }: any) => {
	const toast = useToast();
	const [devTab, setDevTab] = useAtom(developerTabAtom);

	const { appName, pageName } = useAtomValue(pageAtom);
	const { pageId } = useParams();

	const {
		isOpen: mouseOver,
		onClose: triggerMouseLeave,
		onOpen: triggerMouseHover,
	} = useDisclosure();

	const { isOpen: isEdit, onClose: onEditClose, onOpen: onEditOpen } = useDisclosure();

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

	const mutation = useUpdateFile({
		onSuccess: () => {
			onEditClose();
			toast({
				status: 'success',
				title: 'File Updated',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete table',
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
			});
		},
	});

	const onSubmit = (newFileName: any) => {
		if (newFileName.trim()) {
			mutation.mutate({
				pageName,
				appName,
				fileName: file.name,
				newFileName,
				fileType: file.type,
				pageId,
			});
		} else {
			toast({
				status: 'error',
				title: 'File name is required',
			});
		}
	};

	const onKeyDown = (e: any) => {
		if (e.key === 'Enter') {
			e?.preventDefault();
			onSubmit(e.target.value);
		}
	};

	return (
		<Button
			onMouseEnter={triggerMouseHover}
			onMouseLeave={triggerMouseLeave}
			onMouseOver={triggerMouseHover}
			onDoubleClick={onEditOpen}
			colorScheme="gray"
			variant={isActive ? 'solid' : 'outline'}
			onClick={() => {
				setDevTab({
					type: isSQLFile ? 'sql' : 'function',
					id: file.id,
				});
			}}
			key={file.id}
		>
			{isEdit ? (
				<Stack spacing="0">
					<Input
						variant="outline"
						autoFocus
						placeholder="Enter new name"
						onBlur={onEditClose}
						_focus={{
							bg: 'white',
						}}
						defaultValue={file.name}
						onKeyDown={onKeyDown}
						size="xs"
					/>
					{mutation.isLoading ? <Progress isIndeterminate size="xs" /> : null}
				</Stack>
			) : (
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
			)}
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
