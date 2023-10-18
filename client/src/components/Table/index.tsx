import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

export const ChakraTable = ({ columns, rows, ...props }: any) => {
	return (
		<Table borderLeftWidth="1px" borderRightWidth="1px" w="full" h="full" {...props}>
			<Thead>
				<Tr>
					{columns.map((c: string) => (
						<Th color="heading" key={c}>
							{c}
						</Th>
					))}
				</Tr>
			</Thead>
			<Tbody overflow="auto">
				{rows.map((row: any) => (
					<Tr key={JSON.stringify(row)}>
						{row.map((cell: any) => (
							<Td key={JSON.stringify({ row, cell })}>{cell}</Td>
						))}
					</Tr>
				))}
			</Tbody>
		</Table>
	);
};
