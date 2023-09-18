import { Box, Flex, Input, Stack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useCurrentTableData } from '@/features/new-smart-table/hooks';
import { filtersAtom } from '@/features/new-smart-table/atoms';

export const PinnedFilters = () => {
	const [filters, setFilters] = useAtom(filtersAtom);

	const { columns } = useCurrentTableData();
	const pinnedFilters = filters.filter((f) => f.pinned);

	if (pinnedFilters.length === 0) {
		return null;
	}

	return (
		<Stack
			direction="row"
			borderRadius="sm"
			px="2"
			spacing="2"
			flex="1"
			overflow="auto"
			w="full"
		>
			{pinnedFilters.map((f) => {
				const colType = columns?.[f.column]?.type;
				let inputType = 'text';

				if (colType === 'integer') {
					inputType = 'number';
				}
				return (
					<Flex fontSize="sm" borderWidth="1px" borderRadius="sm">
						<Box h="full" py="1" px="3" borderRightWidth="1px">
							{f.column_name}
						</Box>
						<Box h="full" py="1" px="3" borderRightWidth="1px">
							{f.condition}
						</Box>
						<Input
							type={inputType}
							colorScheme="blue"
							value={f.value}
							size="sm"
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
							h="full"
							placeholder="Enter value"
						/>
					</Flex>
				);
			})}
		</Stack>
	);
};
