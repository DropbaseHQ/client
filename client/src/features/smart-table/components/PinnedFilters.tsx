import { Box, Flex, Input, Stack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { filtersAtom } from '@/features/smart-table/atoms';

export const PinnedFilters = ({ columns }: { columns: any }) => {
	const [filters, setFilters] = useAtom(filtersAtom);

	const pinnedFilters = filters.filter((f) => f.pinned);

	if (pinnedFilters.length === 0) {
		return null;
	}

	return (
		<Stack direction="row" borderRadius="sm" p="2" flex="1" overflow="auto" w="full">
			{pinnedFilters.map((f) => {
				const colType = columns.find((c: any) => c.name === f.column)?.type;
				let inputType = 'text';

				if (colType === 'integer') {
					inputType = 'number';
				}
				return (
					<Flex borderWidth="1px" borderRadius="sm">
						<Box
							h="full"
							py="2"
							px="4"
							borderRightWidth="1px"
							fontSize="sm"
							bg="gray.50"
						>
							{f.column_name}
						</Box>
						<Box
							h="full"
							py="2"
							px="4"
							borderRightWidth="1px"
							fontSize="sm"
							bg="gray.50"
						>
							{f.operator}
						</Box>
						<Input
							type={inputType}
							colorScheme="blue"
							value={f.value}
							borderWidth="0"
							onChange={(e) => {
								setFilters(
									filters.map((filter) => {
										if (filter.id === f.id) {
											return {
												...f,
												value:
													inputType === 'number'
														? +e.target.value
														: e.target.value,
											};
										}

										return filter;
									}),
								);
							}}
							borderRadius="sm"
							bg="bg-canvas"
							size="sm"
							h="full"
							placeholder="Enter value"
						/>
					</Flex>
				);
			})}
		</Stack>
	);
};
