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
import { useEffect } from 'react';
import { Filter as FilterIcon, Plus, Star, Trash } from 'react-feather';
import { useAtom, useAtomValue } from 'jotai';
import { filtersAtom } from '@/features/smart-table/atoms';
import {
	useCurrentTableData,
	useCurrentTableName,
	usePinFilters,
} from '@/features/smart-table/hooks';
import { useGetTable } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { getPGColumnBaseType } from '@/utils';
import { appModeAtom } from '@/features/app/atoms';

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

const TEXT_OPERATORS = [
	{
		name: 'Contains',
		value: 'like',
	},
];

const getConditionsByType = (type?: string) => {
	if (type) {
		switch (getPGColumnBaseType(type)) {
			case 'float':
			case 'integer': {
				return [...COMMON_OPERATORS, ...COMPARISON_OPERATORS];
			}

			case 'datetime':
			case 'time':
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
			case 'text': {
				return [...TEXT_OPERATORS, ...COMMON_OPERATORS];
			}
			default:
				return COMMON_OPERATORS;
		}
	}

	return COMMON_OPERATORS;
};

export const FilterButton = () => {
	const toast = useToast();
	const tableId = useCurrentTableName();
	const { isOpen, onToggle, onClose } = useDisclosure();

	const { isPreview } = useAtomValue(appModeAtom);

	const { columnDict: columns } = useCurrentTableData(tableId);

	const [allFilters, setFilters] = useAtom(filtersAtom);
	const filters = allFilters[tableId] || [];

	const pinFilterMutation = usePinFilters({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Pinned filters updated',
			});
		},
	});

	const { filters: pinnedFilters } = useGetTable(tableId || '');

	useEffect(() => {
		setFilters((old: any) => ({
			...old,
			[tableId]: pinnedFilters,
		}));
	}, [tableId, pinnedFilters, setFilters]);

	const haveFiltersApplied =
		filters.length > 0 && filters.every((f: any) => f.column_name && f.value);

	const handleAddFilter = () => {
		setFilters((old: any) => ({
			...old,
			[tableId]: [
				...filters,
				{
					column_name: '',
					value: null,
					condition: '=',
					id: crypto.randomUUID(),
				},
			],
		}));
	};

	const handleReset = () => {
		setFilters((old: any) => ({
			...old,
			[tableId]: [],
		}));
	};

	const handlePinnedFilters = (updatedFilters: any) => {
		setFilters((old: any) => ({
			...old,
			[tableId]: updatedFilters,
		}));

		if (!isPreview) {
			pinFilterMutation.mutate({
				tableId,
				filters: updatedFilters.filter((f: any) => f.pinned),
			});
		}
	};

	const handleRemoveFilter = (removedId: any) => {
		handlePinnedFilters(filters.filter((f: any) => f.id !== removedId));
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
							{filters.map((filter: any, index: any) => {
								const colType = columns[filter?.column_name]?.type;

								let inputType = 'text';

								if (getPGColumnBaseType(colType) === 'integer') {
									inputType = 'number';
								}

								return (
									<HStack w="full" key={`filter-${index}`}>
										{isPreview ? null : (
											<IconButton
												aria-label="Pin filter"
												icon={<Star size="14" />}
												size="sm"
												colorScheme="yellow"
												isDisabled={!filter.column_name}
												variant={filter.pinned ? 'solid' : 'outline'}
												onClick={() => {
													const newFilters = filters.map(
														(f: any, i: any) => {
															if (i === index) {
																return {
																	...f,
																	pinned: !f.pinned,
																};
															}

															return f;
														},
													);

													handlePinnedFilters(newFilters);
												}}
											/>
										)}

										<FormControl flexGrow="1">
											<Select
												value={filter.column_name}
												onChange={(e) => {
													const newFilters = filters.map(
														(f: any, i: any) => {
															if (i === index) {
																return {
																	...f,
																	column_name: e.target.value,
																};
															}

															return f;
														},
													);

													setFilters((old: any) => ({
														...old,
														[tableId]: newFilters,
													}));

													if (filter?.pinned) {
														handlePinnedFilters(newFilters);
													}
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
													const newFilters = filters.map(
														(f: any, i: any) => {
															if (i === index) {
																return {
																	...f,
																	condition: e.target.value,
																};
															}

															return f;
														},
													);

													setFilters((old: any) => ({
														...old,
														[tableId]: newFilters,
													}));

													if (filter?.pinned) {
														handlePinnedFilters(newFilters);
													}
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
													setFilters((old: any) => ({
														...old,
														[tableId]: filters.map((f: any, i: any) => {
															if (i === index) {
																const numberInput =
																	e.target.value === ''
																		? null
																		: +e.target.value;
																return {
																	...f,
																	value:
																		inputType === 'number'
																			? numberInput
																			: e.target.value,
																};
															}

															return f;
														}),
													}));
												}}
												isDisabled={
													filter.condition === 'is null' ||
													filter.condition === 'is not null'
												}
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
				<PopoverFooter border="0" display="flex" alignItems="center" pb={4}>
					<ButtonGroup size="sm">
						<Button colorScheme="gray" onClick={handleReset}>
							Reset all
						</Button>
						<Button
							leftIcon={<Plus size={12} />}
							colorScheme="blue"
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
