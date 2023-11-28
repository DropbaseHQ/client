import { useAtom } from 'jotai';
import { Box, Button, FormControl, IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { tablePageInfoAtom } from '../atoms';
import { useCurrentTableData, useCurrentTableId } from '../hooks';
import { InputRenderer } from '@/components/FormInput';

export const Pagination = () => {
	const [allPageInfo, setPageInfo] = useAtom(tablePageInfoAtom);

	const tableId = useCurrentTableId();
	const tablePageInfo = allPageInfo[tableId];

	const { rows, isLoading } = useCurrentTableData(tableId);

	const handlePageSize = (newSize: any) => {
		setPageInfo((old: any) => ({
			...old,
			[tableId]: {
				...(old[tableId] || {}),
				pageSize: +newSize,
			},
		}));
	};

	const handlePage = (newPage: any) => {
		setPageInfo((old: any) => ({
			...old,
			[tableId]: {
				...(old[tableId] || {}),
				currentPage: newPage,
			},
		}));
	};

	if (!tablePageInfo) {
		return null;
	}

	return (
		<Stack alignItems="center" borderRadius="sm" borderWidth="1px" p="2" direction="row">
			<FormControl>
				<InputRenderer
					size="xs"
					flex="1"
					maxW="20"
					type="select"
					placeholder="select page size"
					value={tablePageInfo.pageSize}
					options={[1, 10, 20, 50, 100].map((size) => ({ name: size, value: size }))}
					onChange={handlePageSize}
				/>
			</FormControl>
			{!isLoading && tablePageInfo.currentPage > 0 && rows.length === 0 ? (
				<Stack direction="row" ml="auto">
					<Tooltip label="Seems like the page doesnt have any data. Try changing pages or click to go to first page">
						<Button
							onClick={() => {
								handlePage(0);
							}}
							size="xs"
							variant="outline"
							colorScheme="gray"
						>
							Go to first page
						</Button>
					</Tooltip>
				</Stack>
			) : null}
			<Stack alignItems="center" spacing="0" direction="row" ml="auto">
				<IconButton
					icon={<ChevronLeft size="14" />}
					variant="outline"
					size="xs"
					colorScheme="gray"
					aria-label="Prev page"
					borderTopRightRadius="none"
					borderBottomRightRadius="none"
					onClick={() => {
						handlePage(+tablePageInfo.currentPage - 1);
					}}
					isDisabled={tablePageInfo.currentPage <= 0}
					flexShrink="0"
				/>
				<Box fontSize="sm" lineHeight={1} fontWeight="medium" px="2.5">
					{tablePageInfo.currentPage + 1}
				</Box>
				<IconButton
					icon={<ChevronRight size="14" />}
					variant="outline"
					size="xs"
					colorScheme="gray"
					aria-label="Next page"
					borderTopLeftRadius="none"
					borderBottomLeftRadius="none"
					onClick={() => {
						handlePage(+tablePageInfo.currentPage + 1);
					}}
					isDisabled={tablePageInfo.pageSize >= rows.length}
					flexShrink="0"
				/>
			</Stack>
		</Stack>
	);
};
