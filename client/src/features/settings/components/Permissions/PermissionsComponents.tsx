import {
	Flex,
	Box,
	VStack,
	Table,
	Thead,
	Tbody,
	Text,
	Th,
	Td,
	Tr,
	Radio,
	useRadioGroup,
	Input,
	Stack,
	Tooltip,
} from '@chakra-ui/react';

import { HelpCircle, Icon as ReactFeatherIcon } from 'react-feather';
import { useEffect } from 'react';

export const PermissionsSubjectRow = ({
	name,
	id,
	isSelected,
	Icon,
	onClick,
}: {
	name: string;
	id: string;
	isSelected: boolean;
	Icon: ReactFeatherIcon;
	onClick: (id: string) => void;
}) => {
	const handleClick = () => {
		onClick(id);
	};
	return (
		<Box
			w="full"
			borderRadius="sm"
			bgColor={isSelected ? 'gray.100' : ''}
			px="5"
			py="2"
			_hover={{ bgColor: 'gray.100', cursor: 'pointer' }}
			display="flex"
			alignItems="center"
			onClick={handleClick}
		>
			<Box mr="2">
				<Icon size="13" color="gray" />
			</Box>
			<Text fontSize="md">{name}</Text>
		</Box>
	);
};

export const PermissionsSubLayout = ({ list, table, selectedName }: any) => {
	return (
		<Flex w="full" h="100%">
			<Box w="15vw" borderRight="1px" borderColor="gray.100" overflow="auto" h="100%">
				<VStack py="4" spacing="0" maxH="82vh">
					{list}
				</VStack>
			</Box>

			<Flex flexGrow="6" p="6" direction="column">
				{selectedName ? (
					<>
						<Text fontSize="lg" fontWeight="semibold" mb="2">
							{selectedName} Permissions
						</Text>
						{table}
					</>
				) : null}
			</Flex>
		</Flex>
	);
};
export const PermissionsTableRow = ({
	name,
	initialValue,
	handleSelect,
}: {
	name: string;
	initialValue?: string;
	handleSelect: (value: string) => void;
}) => {
	const { getRootProps, getRadioProps, setValue } = useRadioGroup({
		onChange: handleSelect,
	});

	useEffect(() => {
		if (initialValue) setValue(initialValue);
		else setValue('none');
	}, [initialValue, setValue]);

	return (
		<Tr
			{...getRootProps()}
			_hover={{
				bg: 'gray.100',
			}}
		>
			<Td borderColor="gray.200">{name}</Td>
			<Td borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'none' })} position="relative" />
			</Td>
			<Td borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'use' })} position="relative" />
			</Td>
			<Td borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'edit' })} position="relative" />
			</Td>
			<Td borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'own' })} position="relative" />
			</Td>
		</Tr>
	);
};

export const PermissionsFilter = ({
	name,
	operator,
	value,
	onChange,
}: {
	name: string;
	operator: string;
	value: string;
	onChange: (e: any) => void;
}) => {
	return (
		<Flex fontSize="sm" borderWidth="1px" borderRadius="sm" justifyContent="center">
			<Box h="full" py="1" px="3" display="flex" alignItems="center" borderRightWidth="1px">
				{name}
			</Box>
			<Box h="full" py="1" px="3" display="flex" alignItems="center" borderRightWidth="1px">
				{operator}
			</Box>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search"
				size="sm"
				colorScheme="blue"
				borderWidth="0"
			/>
		</Flex>
	);
};

export const PermissionsFilterRow = ({ children }: any) => {
	return (
		<Stack
			bg="white"
			borderWidth="1px"
			borderRadius="sm"
			direction="row"
			p="1.5"
			alignItems="center"
			w="25vw"
		>
			<Stack direction="row" borderRadius="sm" spacing="6" flex="1" overflow="auto" w="full">
				{children}
			</Stack>
		</Stack>
	);
};

const PermissionsTableHeader = ({ name, label }: { name: string; label?: string }) => {
	return (
		<Th>
			<Box display="flex" alignItems="center">
				{name}
				<Box ml="1">
					<Tooltip label={label || ''} placement="top-start">
						<HelpCircle size="12" />
					</Tooltip>
				</Box>
			</Box>
		</Th>
	);
};

export const PermissionsTable = ({ subjectName, tableRows }: any) => {
	return (
		<Box
			mt="2"
			border="1px"
			overflowY="auto"
			w="25vw"
			minW="470px"
			borderColor="gray.200"
			maxHeight="65vh"
		>
			<Table variant="unstyled">
				<Thead position="sticky" bgColor="white" top="-1" zIndex="1000">
					<Tr>
						<Th>{subjectName}</Th>

						<PermissionsTableHeader
							name="None"
							label="A user with no permissions. Is just a member of the workspace."
						/>
						<PermissionsTableHeader
							name="Use"
							label="Use access allows a user or group to view and use an app. They can't edit or delete the app."
						/>
						<PermissionsTableHeader
							name="Edit"
							label="Edit access allows a user or group to view, use, and edit an app. They can't change the app's permissions, manage users, or delete the app."
						/>
						<PermissionsTableHeader
							name="Own"
							label="Own access allows a user or group to view, use, edit, and delete an app. They can also manage the app's permissions and users."
						/>
					</Tr>
				</Thead>
				<Tbody w="full" overflowY="auto" insetBlockEnd={0}>
					{tableRows}
				</Tbody>
			</Table>
		</Box>
	);
};
