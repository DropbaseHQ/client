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
import { sortsAtom } from '@/features/smart-table/atoms';

export const SortButton = ({ columns }: { columns: any }) => {
	const { isOpen, onToggle, onClose } = useDisclosure();

	const [sorts, setSorts] = useAtom(sortsAtom);

	const haveSortsApplied = sorts.length > 0 && sorts.every((f) => f.column);

	const handleAddSort = () => {
		setSorts([
			...sorts,
			{
				column_name: '',
				sort: 'asc',
			},
		]);
	};

	const handleReset = () => {
		setSorts([]);
	};

	const handleRemoveSort = (index: number) => {
		setSorts(sorts.filter((_, i) => i !== index));
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
			<PopoverTrigger>
				<Button
					leftIcon={<SortIcon size={14} />}
					size="sm"
					onClick={onToggle}
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
							{sorts.map((sort, index) => {
								return (
									<HStack w="full" key={`sort-${index}`}>
										<FormControl flexGrow="1">
											<Select
												value={`${sort.schema_name}.${sort.table_name}.${sort.column_name}`}
												onChange={(e) => {
													setSorts(
														sorts.map((f, i) => {
															const [folder, table, col] =
																e.target.value.split('.');

															if (i === index) {
																return {
																	...f,
																	column_name: col,
																	table_name: table,
																	schema_name: folder,
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
													<option
														value={`${column.folder}.${column.table}.${column.name}`}
														key={column.name}
													>
														{column.name}
													</option>
												))}
											</Select>
										</FormControl>
										<FormControl flexGrow="1">
											<Select
												colorScheme="blue"
												value={sort.sort}
												onChange={(e) => {
													setSorts(
														sorts.map((f, i) => {
															if (i === index) {
																return {
																	...f,
																	sort: e.target.value,
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
