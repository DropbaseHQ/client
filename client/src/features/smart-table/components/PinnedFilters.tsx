import { Flex, Input, Stack, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useCurrentTableData, useCurrentTableName } from '@/features/smart-table/hooks';
import { filtersAtom } from '@/features/smart-table/atoms';

export const PinnedFilters = () => {
	const [allFilters, setFilters] = useAtom(filtersAtom);

	const tableId = useCurrentTableName();

	const filters = allFilters?.[tableId] || [];
	const { columns } = useCurrentTableData(tableId);
	const pinnedFilters = filters.filter((f: any) => f.pinned);

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
			{pinnedFilters.map((f: any) => {
				const colType = columns?.[f?.column_name]?.display_type;
				let inputType = 'text';

				if (colType === 'integer') {
					inputType = 'number';
				}

				return (
					<Flex
						key={f.id}
						fontSize="sm"
						borderRadius="sm"
						justify="center"
						alignItems="center"
					>
						<Text ml="3" mr="1" fontSize="sm" fontWeight="medium">
							{f.column_name}
						</Text>
						<Text mr="2" fontSize="sm" fontWeight="normal">
							{f.condition}
						</Text>
						<Input
							type={inputType}
							colorScheme="blue"
							value={f.value}
							size="sm"
							borderWidth="1px"
							onChange={(e) => {
								setFilters((old: any) => ({
									...old,
									[tableId]: filters.map((filter: any) => {
										if (filter.id === f.id) {
											const numberInput =
												e.target.value === '' ? null : +e.target.value;
											return {
												...f,
												value:
													inputType === 'number'
														? numberInput
														: e.target.value,
											};
										}

										return filter;
									}),
								}));
							}}
							borderRadius="sm"
							h="2.2em"
							placeholder="Enter value"
						/>
					</Flex>
				);
			})}
		</Stack>
	);
};
