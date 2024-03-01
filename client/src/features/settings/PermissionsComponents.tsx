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
} from '@chakra-ui/react';
import { useEffect } from 'react';

export const PermissionsSubjectRow = ({
	name,
	id,
	isSelected,
	onClick,
}: {
	name: string;
	id: string;
	isSelected: boolean;
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
			px="3"
			py="2"
			_hover={{ bgColor: 'gray.100', cursor: 'pointer' }}
			display="flex"
			alignItems="center"
			onClick={handleClick}
		>
			{name}
		</Box>
	);
};
export const PermissionsSubLayout = ({ list, table, selectedName }: any) => {
	return (
		<Flex w="full" h="100%">
			<VStack flexGrow="1" py="4" spacing="0" borderRight="1px" borderColor="gray.100">
				{list}
			</VStack>
			<Flex flexGrow="6" p="6" direction="column" h="100%" overflow="auto">
				{selectedName ? (
					<>
						<Text fontSize="2xl" fontWeight="semibold" mb="2">
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
			<Td border="1px 0px" borderColor="gray.200">
				{name}
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'none' })} />
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'use' })} />
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'edit' })} />
			</Td>
			<Td border="1px 0px" borderColor="gray.200">
				<Radio {...getRadioProps({ value: 'own' })} />
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
			w="40vw"
		>
			<Stack
				direction="row"
				borderRadius="sm"
				px="2"
				spacing="6"
				flex="1"
				overflow="auto"
				w="full"
			>
				{children}
			</Stack>
		</Stack>
	);
};

export const PermissionsTable = ({ subjectName, tableRows }: any) => {
	return (
		<Table
			mt="2"
			variant="unstyled"
			w="40vw"
			h="min-content"
			maxHeight="500px"
			overflowY="scroll"
		>
			<Thead border="1px" borderColor="gray.200">
				<Tr>
					<Th border="1px 0px" borderColor="gray.200">
						{subjectName}
					</Th>
					<Th border="1px 0px" borderColor="gray.200">
						None
					</Th>
					<Th>Use</Th>
					<Th border="1px 0px" borderColor="gray.200">
						Edit
					</Th>
					<Th border="1px 0px" borderColor="gray.200">
						Own
					</Th>
				</Tr>
			</Thead>
			<Tbody border="1px" borderColor="gray.200" maxHeight="50vh" overflow="auto">
				{tableRows}
			</Tbody>
		</Table>
	);
};
