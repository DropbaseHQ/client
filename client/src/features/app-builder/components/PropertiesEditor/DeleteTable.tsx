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

export const DeleteTable = ({ tableId, tableName, ...props }: any) => {
	const toast = useToast();
	const setDevTab = useSetAtom(inspectedResourceAtom);

	const { appName, pageName } = useParams();

	const { properties } = useGetPage({ appName, pageName });

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			setDevTab({
				type: null,
				id: null,
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
		if (properties.tables.length == 1) {
			toast({
				status: 'error',
				title: 'Failed to delete table',
				description: 'Your app must have atleast one table',
			});
			return;
		}

		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				tables: [...(properties?.tables || []).filter((t: any) => t.name !== tableId)],
			},
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					variant="ghost"
					colorScheme="red"
					aria-label="Delete table"
					onClick={onToggle}
					type="button"
					isLoading={mutation.isLoading}
					size="sm"
					{...props}
					icon={<Trash size="14" />}
				/>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
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
