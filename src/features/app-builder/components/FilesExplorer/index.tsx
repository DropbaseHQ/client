import { useAtom } from 'jotai';
import {
	Box,
	Icon,
	Skeleton,
	Stack,
	useDisclosure,
	Spacer,
	Text,
	Center,
	Link,
} from '@chakra-ui/react';
import { Code, Box as BoxIcon, FileText } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { useGetPage } from '@/features/page';

const FileButton = ({ file }: any) => {
	const [devTab, setDevTab] = useAtom(developerTabAtom);

	const { onClose: triggerMouseLeave, onOpen: triggerMouseHover } = useDisclosure();

	const isPythonFile = file.type === 'python';
	const isActive = file.name === devTab.id;

	const colorScheme = isPythonFile ? 'purple' : 'teal';

	let icon = Code;

	switch (file.type) {
		case 'json':
			icon = FileText;
			break;
		case 'python':
			icon = BoxIcon;
			break;
		default:
	}

	return (
		<Stack
			onMouseEnter={triggerMouseHover}
			onMouseLeave={triggerMouseLeave}
			onMouseOver={triggerMouseHover}
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
					type: file.type,
					id: file.name,
				});
			}}
			key={file.name}
		>
			<Stack flex="1" w="full" alignItems="center" direction="row">
				<Icon color={isActive ? `${colorScheme}.500` : ''} as={icon} boxSize={4} />

				<Box
					fontWeight={isActive ? 'medium' : 'normal'}
					overflow="hidden"
					whiteSpace="nowrap"
				>
					{file.title}
				</Box>
				<Box fontSize="2xs" px="1" borderRadius="sm" bg={`${colorScheme}.200`}>
					{file.name}.{isPythonFile ? 'py' : file.type}
				</Box>

				<Spacer />
			</Stack>
		</Stack>
	);
};

export const FilesExplorer = () => {
	const { appName, pageName } = useParams();
	const { files, isLoading } = useGetPage({ appName, pageName });

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

	if (files?.length === 0) {
		return (
			<Center spacing="0.5" as={Stack}>
				<Text fontSize="md" fontWeight="semibold">
					No files present
				</Text>
				<Link fontSize="sm" href="https://docs.dropbase.io/concepts/studio/" isExternal>
					Learn more
				</Link>
			</Center>
		);
	}

	return (
		<Stack spacing="0" h="full">
			{(files || [])
				.sort((a: any, b: any) => a.name.localeCompare(b.name))
				.map((f: any) => {
					return <FileButton file={f} key={f.name} />;
				})}
		</Stack>
	);
};
