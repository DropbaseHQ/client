import {
	Button,
	ButtonGroup,
	FormControl,
	HStack,
	IconButton,
	Input,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Select,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import { Filter as FilterIcon, Plus, Star, Trash } from 'react-feather';
import { useAtom } from 'jotai';
import { filtersAtom } from '@/features/smart-table/atoms';

const COMMON_OPERATORS = [
	{
		name: 'Equal',
		value: '=',
	},
	{
		name: 'Is not Equal',
		value: '!=',
	},
	{
		name: 'Is empty',
		value: 'is null',
	},
	{
		name: 'Not empty',
		value: 'is not null',
	},
];

const COMPARISON_OPERATORS = [
	{
		name: 'Greater than',
		value: '>',
	},

	{
		name: 'Less than',
		value: '<',
	},
	{
		name: 'Greater than or equal to',
		value: '>=',
	},

	{
		name: 'Less than or equal to',
		value: '<=',
	},
];

const getOperatorsByType = (type?: string) => {
	switch (type?.toLowerCase()) {
		case 'integer': {
			return [...COMMON_OPERATORS, ...COMPARISON_OPERATORS];
		}
		case 'date': {
			return [
				...COMMON_OPERATORS,
				{
					name: 'After',
					value: '>',
				},
				{
					name: 'Before',
					value: '<',
				},
			];
		}
		default:
			return COMMON_OPERATORS;
	}
};

export const FilterButton = ({ columns }: { columns: any }) => {
	const { isOpen, onToggle, onClose } = useDisclosure();

	const [filters, setFilters] = useAtom(filtersAtom);

	const haveFiltersApplied = filters.length > 0 && filters.every((f) => f.column && f.value);

	const handleAddFilter = () => {
		setFilters([
			...filters,
			{
				column: '',
				value: null,
				operator: '=',
				id: crypto.randomUUID(),
			},
		]);
	};

	const handleReset = () => {
		setFilters([]);
	};

	const handleRemoveFilter = (index: number) => {
		setFilters(filters.filter((_, i) => i !== index));
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
			<PopoverTrigger>
				<Button
					leftIcon={<FilterIcon size={14} />}
					size="sm"
					onClick={onToggle}
					colorScheme={haveFiltersApplied ? 'blue' : 'gray'}
				>
					Filters
				</Button>
			</PopoverTrigger>
			<PopoverContent boxShadow="md" minW="35rem">
				<PopoverHeader pt={4} fontWeight="bold" border="0">
					Filter Data
				</PopoverHeader>
				<PopoverArrow />
				<PopoverCloseButton mt={2} onClick={onClose} />
				<PopoverBody>
					{filters.length === 0 ? (
						<Text color="gray">No filters applied</Text>
					) : (
						<VStack alignItems="start" w="full">
							{filters.map((filter, index) => {
								const colType = columns.find((c: any) => c.name === filter.column)
									?.type;
								return (
									<HStack w="full" key={`filter-${index}`}>
										<IconButton
											aria-label="Pin filter"
											icon={<Star size="14" />}
											size="sm"
											colorScheme="yellow"
											variant={filter.pinned ? 'solid' : 'outline'}
											onClick={() => {
												setFilters(
													filters.map((f, i) => {
														if (i === index) {
															return {
																...f,
																pinned: !f.pinned,
															};
														}

														return f;
													}),
												);
											}}
										/>

										<FormControl flexGrow="1">
											<Select
												value={filter.column}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	column: e.target.value,
																};
															}

															return f;
														}),
													);
												}}
												size="sm"
												bg="bg-canvas"
												placeholder="Select column"
											>
												{columns.map((column: any) => (
													<option value={column.name} key={column.name}>
														{column.name}
													</option>
												))}
											</Select>
										</FormControl>
										<FormControl flexGrow="1">
											<Select
												colorScheme="blue"
												value={filter.operator}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	operator: e.target.value,
																};
															}

															return f;
														}),
													);
												}}
												bg="bg-canvas"
												size="sm"
												placeholder="Select operator"
											>
												{getOperatorsByType(colType).map((operator) => (
													<option
														value={operator.value}
														key={operator.value}
													>
														{operator.name}
													</option>
												))}
											</Select>
										</FormControl>
										<FormControl flexGrow="1">
											<Input
												type={colType}
												colorScheme="blue"
												value={filter.value}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	value: e.target.value,
																};
															}

															return f;
														}),
													);
												}}
												borderRadius="sm"
												bg="bg-canvas"
												size="sm"
												placeholder="Enter value"
											/>
										</FormControl>
										<IconButton
											aria-label="Delete filter"
											icon={<Trash size="14" />}
											size="sm"
											colorScheme="red"
											variant="outline"
											onClick={() => {
												handleRemoveFilter(index);
											}}
										/>
									</HStack>
								);
							})}
						</VStack>
					)}
				</PopoverBody>
				<PopoverFooter
					border="0"
					display="flex"
					alignItems="center"
					justifyContent="right"
					pb={4}
				>
					<ButtonGroup size="sm">
						<Button colorScheme="gray" onClick={handleReset}>
							Reset all
						</Button>
						<Button
							leftIcon={<Plus size={12} />}
							variant="primary"
							onClick={handleAddFilter}
						>
							Add Filter
						</Button>
					</ButtonGroup>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
};
