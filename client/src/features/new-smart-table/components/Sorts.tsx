import {
	Button,
	ButtonGroup,
	FormControl,
	HStack,
	IconButton,
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
import { ChevronsUp as SortIcon, Plus, Trash } from 'react-feather';
import { useAtom } from 'jotai';
import { sortsAtom } from '@/features/new-smart-table/atoms';
import { useCurrentTableData, useCurrentTableId } from '@/features/new-smart-table/hooks';

export const SortButton = () => {
	const { isOpen, onToggle, onClose } = useDisclosure();
	const tableId = useCurrentTableId();
	const { columns } = useCurrentTableData(tableId);

	const [allSorts, setSorts] = useAtom(sortsAtom);
	const sorts: any = allSorts[tableId] || [];

	const haveSortsApplied = sorts.length > 0 && sorts.every((f: any) => f.column_name);

	const saveSorts = (newSorts: any) => {
		setSorts((old: any) => ({
			...old,
			[tableId]: newSorts,
		}));
	};

	const handleAddSort = () => {
		saveSorts([
			...sorts,
			{
				column_name: '',
				value: 'asc',
			},
		]);
	};

	const handleReset = () => {
		saveSorts([]);
	};

	const handleRemoveSort = (index: number) => {
		saveSorts(sorts.filter((_: any, i: any) => i !== index));
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
			<PopoverTrigger>
				<Button
					leftIcon={<SortIcon size={14} />}
					size="sm"
					onClick={onToggle}
					variant="ghost"
					colorScheme={haveSortsApplied ? 'blue' : 'gray'}
				>
					Sorts
				</Button>
			</PopoverTrigger>
			<PopoverContent boxShadow="md" minW="35rem">
				<PopoverHeader pt={4} fontWeight="bold" border="0">
					Sort Data
				</PopoverHeader>
				<PopoverArrow />
				<PopoverCloseButton mt={2} onClick={onClose} />
				<PopoverBody>
					{sorts.length === 0 ? (
						<Text color="gray">No sorts applied</Text>
					) : (
						<VStack alignItems="start" w="full">
							{sorts.map((sort: any, index: any) => {
								return (
									<HStack w="full" key={`sort-${index}`}>
										<FormControl flexGrow="1">
											<Select
												value={sort.column_name}
												onChange={(e) => {
													saveSorts(
														sorts.map((f: any, i: any) => {
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
												value={sort.value}
												onChange={(e) => {
													saveSorts(
														sorts.map((f: any, i: any) => {
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
												bg="bg-canvas"
												size="sm"
												placeholder="Select Sort"
											>
												<option value="asc">Ascending</option>
												<option value="desc">Descending</option>
											</Select>
										</FormControl>
										<IconButton
											aria-label="Delete sort"
											icon={<Trash size="14" />}
											size="sm"
											colorScheme="red"
											variant="outline"
											onClick={() => {
												handleRemoveSort(index);
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
							onClick={handleAddSort}
						>
							Add Sort
						</Button>
					</ButtonGroup>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
};
