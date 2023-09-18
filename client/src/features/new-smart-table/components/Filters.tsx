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
import { useAtom, useAtomValue } from 'jotai';
import { filtersAtom } from '@/features/new-smart-table/atoms';
import { useCurrentTableData, usePinFilters } from '@/features/new-smart-table/hooks';
import { pageAtom } from '@/features/new-page';
import { useGetTable } from '@/features/new-app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';

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

const getConditionsByType = (type?: string) => {
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

export const FilterButton = () => {
	const toast = useToast();
	const { tableId } = useAtomValue(pageAtom);
	const { isOpen, onToggle, onClose } = useDisclosure();

	const { columns } = useCurrentTableData();

	const [filters, setFilters] = useAtom(filtersAtom);

	const pinFilterMutation = usePinFilters({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Pinned filters updated',
			});
		},
	});

	useGetTable(tableId || '', {
		onSuccess: (data: any) => {
			setFilters(
				(data?.values?.filters || []).map((f: any) => ({
					...f,
					pinned: true,
					id: crypto.randomUUID(),
				})),
			);
		},
	});

	const haveFiltersApplied = filters.length > 0 && filters.every((f) => f.column_name && f.value);

	const handleAddFilter = () => {
		setFilters([
			...filters,
			{
				column_name: '',
				value: null,
				condition: '=',
				id: crypto.randomUUID(),
			},
		]);
	};

	const handleReset = () => {
		setFilters([]);
	};

	const handlePinnedFilters = (updatedFilters: any) => {
		setFilters(updatedFilters);
		pinFilterMutation.mutate({
			tableId,
			filters: updatedFilters.filter((f: any) => f.pinned),
		});
	};

	const handleRemoveFilter = (removedId: any) => {
		handlePinnedFilters(filters.filter((f) => f.id !== removedId));
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
			<PopoverTrigger>
				<Button
					leftIcon={<FilterIcon size={14} />}
					size="sm"
					variant="ghost"
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
								const colType = columns[filter?.column_name]?.type;
								let inputType = 'text';

								if (colType === 'integer') {
									inputType = 'number';
								}

								return (
									<HStack w="full" key={`filter-${index}`}>
										<IconButton
											aria-label="Pin filter"
											icon={<Star size="14" />}
											size="sm"
											colorScheme="yellow"
											isDisabled={!filter.column_name}
											variant={filter.pinned ? 'solid' : 'outline'}
											onClick={() => {
												const newFilters = filters.map((f, i) => {
													if (i === index) {
														return {
															...f,
															pinned: !f.pinned,
														};
													}

													return f;
												});

												handlePinnedFilters(newFilters);
											}}
										/>

										<FormControl flexGrow="1">
											<Select
												value={filter.column_name}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	column_name: e.target.value,
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
												{Object.keys(columns).map((column: any) => (
													<option value={column} key={column}>
														{column}
													</option>
												))}
											</Select>
										</FormControl>
										<FormControl flexGrow="1">
											<Select
												colorScheme="blue"
												value={filter.condition}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	condition: e.target.value,
																};
															}

															return f;
														}),
													);
												}}
												bg="bg-canvas"
												size="sm"
												placeholder="Select condition"
											>
												{getConditionsByType(colType).map((condition) => (
													<option
														value={condition.value}
														key={condition.value}
													>
														{condition.name}
													</option>
												))}
											</Select>
										</FormControl>
										<FormControl flexGrow="1">
											<Input
												type={inputType}
												colorScheme="blue"
												value={filter.value}
												onChange={(e) => {
													setFilters(
														filters.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	value:
																		inputType === 'number'
																			? +e.target.value
																			: e.target.value,
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
												handleRemoveFilter(filter.id);
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
