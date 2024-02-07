import { useAtom } from 'jotai';
import {
	Box,
	Icon,
	IconButton,
	Input,
	Skeleton,
	Stack,
	useDisclosure,
	Spacer,
} from '@chakra-ui/react';
import { Code, Table, Box as BoxIcon, Edit2, Check, X } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { useGetPage } from '@/features/page';
import { DeleteFile } from './DeleteFile';
import { useUpdateFile } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

const FileButton = ({ file }: any) => {
	const toast = useToast();
	const [devTab, setDevTab] = useAtom(developerTabAtom);

	const { appName, pageName } = useParams();
	const { files } = useGetPage({ appName, pageName });

	const { onClose: triggerMouseLeave, onOpen: triggerMouseHover } = useDisclosure();

	const { isOpen: isEdit, onClose: onEditClose, onOpen: onEditOpen } = useDisclosure();

	const isSQLFile = file.type === 'sql';
	const fileName = `${file.name}${isSQLFile ? '.sql' : '.py'}`;
	const isActive = file.name === devTab.id;

	const [newFileName, setNewFileName] = useState(file.name);

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
				description: getErrorMessage(error),
			});
		},
	});

	const nameNotUnique = (name: any) => {
		return files.find((f: any) => {
			return f.name === name && f.name !== file.name;
		});
	};

	const onSubmit = () => {
		console.log(newFileName);
		if (nameNotUnique(newFileName)) {
			toast({
				status: 'error',
				title: 'File name must be unique',
			});
			return;
		}

		if (newFileName.trim()) {
			mutation.mutate({
				pageName,
				appName,
				fileName: file.name,
				newFileName,
				fileType: file.type,
			});
		} else {
			toast({
				status: 'error',
				title: 'File name is required',
			});
		}
	};

	const onKeyDown = (e: any) => {
		if (e.key === 'Escape') {
			onEditClose();
		} else if (e.key === 'Enter') {
			e?.preventDefault();
			onSubmit();
		}
	};

	return (
		<Stack
			onMouseEnter={triggerMouseHover}
			onMouseLeave={triggerMouseLeave}
			onMouseOver={triggerMouseHover}
			onDoubleClick={onEditOpen}
			as="button"
			bg={isActive ? 'gray.50' : 'white'}
			p="2"
			fontSize="sm"
			borderWidth={isActive ? '1px' : '0'}
			justifyContent="start"
			borderRadius="sm"
			_hover={{
				bg: 'gray.50',
				color: 'gray.800',
			}}
			color={isActive ? 'gray.900' : 'gray.700'}
			onClick={() => {
				setDevTab({
					type: isSQLFile ? 'sql' : 'function',
					id: file.name,
				});
			}}
			key={file.name}
		>
			{isEdit ? (
				<Stack flex="1" direction="row" justify="flex-end" w="full">
					<Input
						value={newFileName}
						variant="outline"
						autoFocus
						placeholder="Enter new name"
						_focus={{
							bg: 'white',
						}}
						defaultValue={file.name}
						onKeyDown={onKeyDown}
						onChange={(e) => setNewFileName(e.target.value)}
						size="xs"
					/>
					<IconButton
						aria-label="Cancel rename"
						icon={<X size="sm" />}
						onClick={onEditClose}
						boxSize={5}
						p={1}
						borderRadius="sm"
						background="transparent"
						color="black"
						_hover={{
							bg: 'gray.100',
						}}
						size="sm"
						minWidth={0}
					/>
					<IconButton
						aria-label="Rename function"
						icon={<Check size="sm" />}
						onClick={onSubmit}
						isLoading={mutation.isLoading}
						boxSize={5}
						p={1}
						borderRadius="sm"
						background="transparent"
						color="black"
						_hover={{
							bg: 'green.100',
						}}
						size="sm"
						minWidth={0}
					/>
				</Stack>
			) : (
				<Stack flex="1" w="full" alignItems="center" direction="row">
					<Icon color={isActive ? `${colorScheme}.500` : ''} as={icon} boxSize={4} />

					<Box
						fontWeight={isActive ? 'medium' : 'normal'}
						overflow="hidden"
						whiteSpace="nowrap"
					>
						{file.name}
					</Box>
					<Box fontSize="2xs" px="1" borderRadius="sm" bg={`${colorScheme}.200`}>
						{isSQLFile ? '.sql' : '.py'}
					</Box>

					<Spacer />

					{isActive ? (
						<Stack direction="row" justify="flex-end">
							<IconButton
								aria-label="Rename function"
								icon={<Edit2 size="sm" />}
								onClick={(e) => {
									e.stopPropagation();
									onEditOpen();
								}}
								isLoading={mutation.isLoading}
								boxSize={5}
								p={1}
								borderRadius="sm"
								background="transparent"
								color="black"
								_hover={{
									bg: 'gray.100',
								}}
								size="sm"
								minWidth={0}
							/>
							<DeleteFile
								w="fit-content"
								ml="auto"
								id={file.name}
								name={fileName}
								type={file.type}
							/>
						</Stack>
					) : null}
				</Stack>
			)}
		</Stack>
	);
};

export const FilesExplorer = () => {
	const { appName, pageName } = useParams();
	const { files, isLoading, error } = useGetPage({ appName, pageName });

	const isReady = useMonacoLoader();

	if (!isReady || isLoading) {
		return (
			<Stack borderBottomWidth="1px" bg="white" p="2">
				<Stack>
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
				</Stack>
			</Stack>
		);
	}

	if (error) {
		return <Box color="red.400">{getErrorMessage(error)}</Box>;
	}

	return (
		<Stack spacing="0" h="full">
			{(files || []).map((f: any) => {
				return <FileButton file={f} key={f.name} />;
			})}
		</Stack>
	);
};
