import {
	Button,
	ButtonGroup,
	IconButton,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Portal,
	useDisclosure,
} from '@chakra-ui/react';

import { useSetAtom } from 'jotai';

import { Trash } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { getErrorMessage } from '@/utils';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { useGetTable } from '@/features/app-builder/hooks';

export const DeleteTable = ({ tableId, tableName, ...props }: any) => {
	const { appName, pageName } = useParams();

	const { smart: isSmartTable = false } = useGetTable(tableId || '') || {};

	const toast = useToast();
	const setDevTab = useSetAtom(inspectedResourceAtom);

	const { properties, tables } = useGetPage({ appName, pageName });

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			setDevTab({
				type: null,
				id: null,
				meta: null,
			});
		},
	});

	const mutation = useUpdatePageData({
		onSuccess: () => {
			onClose();
			toast({
				status: 'success',
				title: 'Table Deleted',
			});
			setDevTab({
				type: null,
				id: null,
				meta: null,
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete table',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = () => {
		if (tables.length === 1) {
			toast({
				status: 'error',
				title: 'Failed to delete table',
				description: 'Your app must have atleast one table',
			});
			return;
		}

		const { [tableName]: deletedTable, ...otherProperties } = properties || {};

		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: otherProperties,
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					variant="ghost"
					colorScheme="red"
					aria-label="Delete table"
					onClick={isSmartTable ? onToggle : onSubmit}
					type="button"
					isLoading={mutation.isLoading}
					{...props}
					icon={<Trash size="14" />}
				/>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0" fontSize="md">
						Delete table
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverBody>Are you sure you want to delete {tableName} table?</PopoverBody>
					<PopoverFooter border="0" display="flex" justifyContent="space-between" pb={4}>
						<ButtonGroup ml="auto" size="sm">
							<Button onClick={onClose} colorScheme="gray" variant="ghost">
								Cancel
							</Button>
							<Button
								colorScheme="red"
								type="button"
								onClick={onSubmit}
								isLoading={mutation.isLoading}
							>
								Delete
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Portal>
		</Popover>
	);
};
