import {
	Button,
	ButtonGroup,
	Popover,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	useDisclosure,
} from '@chakra-ui/react';
import { Trash } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { TABLE_DATA_QUERY_KEY, useCurrentTableName } from '@/features/smart-table/hooks';
import { useEvent } from '@/features/app-preview/hooks';
import { useGetPage } from '@/features/page';
import { ACTIONS } from '@/constant';
import { useToast } from '@/lib/chakra-ui';

export const DeleteRowButton = ({ row }: any) => {
	const { appName, pageName } = useParams();
	const toast = useToast();
	const { isOpen, onClose, onToggle } = useDisclosure();
	const tableName = useCurrentTableName();

	const queryClient = useQueryClient();

	const { availableMethods } = useGetPage({ appName, pageName });

	const isDeleteRowMethodPresent = availableMethods?.[tableName]?.methods?.includes(
		ACTIONS.DELETE_ROW,
	);

	const { handleEvent, mutation } = useEvent({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Row deleted',
			});
			queryClient.invalidateQueries([TABLE_DATA_QUERY_KEY, tableName]);
			onClose();
		},
	});

	const handleDelete = () => {
		handleEvent({
			action: ACTIONS.DELETE_ROW,
			resource: tableName,
			section: 'table',
		});
	};

	if (typeof row === 'number' && isDeleteRowMethodPresent) {
		return (
			<Popover
				returnFocusOnClose={false}
				isOpen={isOpen}
				onClose={onClose}
				placement="right"
				closeOnBlur={false}
			>
				<PopoverTrigger>
					<Button
						isLoading={mutation.isLoading}
						leftIcon={<Trash size="14" />}
						size="xs"
						variant="outline"
						colorScheme="red"
						onClick={onToggle}
					>
						Delete Row
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverHeader>Confirm Deleting Row</PopoverHeader>
					<PopoverCloseButton />
					<PopoverBody>Are you sure you want to continue with your action?</PopoverBody>
					<PopoverFooter display="flex" justifyContent="flex-end">
						<ButtonGroup size="sm">
							<Button
								isDisabled={mutation.isLoading}
								colorScheme="gray"
								onClick={onClose}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								isLoading={mutation.isLoading}
								onClick={handleDelete}
								colorScheme="red"
							>
								Delete
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		);
	}

	return null;
};
